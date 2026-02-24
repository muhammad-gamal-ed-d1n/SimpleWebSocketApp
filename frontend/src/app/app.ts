import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Client, IMessage } from '@stomp/stompjs';
import { errorContext } from 'rxjs/internal/util/errorContext';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  username: string = '';
  openChat = false;
  message = '';
  messages: any[] = [];

  stompClient!: Client;

  connect() {
    const socket = new SockJS('http://localhost:8080/ws')

    this.stompClient = new Client({
      webSocketFactory: () => socket,

      onWebSocketError: (err) => {
        console.log("WebSocket Error: ", err)
      },

      onStompError: (frame) => {
        console.log("Error: ", frame.headers['message'])
        console.log("Error Body: ", frame.body)
      },

      onConnect: () => {

        this.stompClient.subscribe('/topic/public', 
          (payload: IMessage) => {
            
            const msg = JSON.parse(payload.body)
            this.messages.push(msg)
          }
        )

        this.stompClient.publish({
          destination: '/app/chat/join',
          body: JSON.stringify({
            sender: this.username,
            type: 'JOIN'
          })
        })
      }
    })

    this.stompClient.activate()
  }

  join() {
    if (this.username != '') {
      this.connect()
      this.openChat = true
    }
  }

  sendMessage() {

    if (this.message && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat/sendmessage',
        body: JSON.stringify({
          sender: this.username,
          content: this.message,
          type: 'MESSAGE'
        })
      })

      this.message = '';
    }
  }
}
