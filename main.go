package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	socketio "github.com/googollee/go-socket.io"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var collection *mongo.Collection

func main() {
	mongoURI := os.Getenv("MONGODB_URL")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal(err)
	}
	collection = client.Database("cluster0").Collection("users")
	fmt.Println("✅ Go est connecté à MongoDB")

	server := socketio.NewServer(nil)

	server.OnConnect("/", func(s socketio.Conn) error {
		fmt.Println("New Connection:", s.ID())
		return nil
	})

	server.OnEvent("/", "login", func(s socketio.Conn, data map[string]interface{}) {
		pseudo := data["pseudo"].(string)
		action := data["action"].(string)

		if action == "register" {
			collection.InsertOne(context.TODO(), bson.M{"pseudo": pseudo, "password": data["password"]})
			s.Emit("login-success", map[string]interface{}{"pseudo": pseudo})
		} else {
			var result bson.M
			err := collection.FindOne(context.TODO(), bson.M{"pseudo": pseudo}).Decode(&result)
			if err != nil {
				s.Emit("login-error", "Utilisateur inconnu")
			} else {
				s.Emit("login-success", map[string]interface{}{"pseudo": pseudo})
			}
		}
	})

	server.OnEvent("/", "send-msg", func(s socketio.Conn, data map[string]interface{}) {
		server.BroadcastToNamespace("/", "msg-in", data)
	})

	go server.Serve()
	defer server.Close()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.Handle("/socket.io/", server)
	fmt.Printf("🚀 Serveur Go actif sur le port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
