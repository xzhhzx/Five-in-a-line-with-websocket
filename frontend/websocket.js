function testWebSocket() {
  const exampleSocket = new WebSocket(
      "ws://localhost:8080/echo"
  );
}

testWebSocket();