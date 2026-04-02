#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

struct sockaddr_in* createIPv4Address(char *ip, int port) {
    struct sockaddr_in *address = malloc(sizeof(struct sockaddr_in));
    address->sin_family = AF_INET;
    address->sin_port = htons(port);
    inet_pton(AF_INET, ip, &address->sin_addr);
    return address;
}

int createTCPIPv4Socket(void) {
    return socket(AF_INET, SOCK_STREAM, 0);
}

int main()
{
    // Test comment for test commit
    int serverFD = createTCPIPv4Socket();

    struct sockaddr_in *address = createIPv4Address("0.0.0.0", 2000);

    bind(serverFD, (struct sockaddr*)address, sizeof(*address));
    printf("bind successful on port 2000\n");

    listen(serverFD, 5);

    struct sockaddr_in clientAddress;
    socklen_t clientSize = sizeof(clientAddress);

    int clientFD = accept(serverFD, (struct sockaddr*)&clientAddress, &clientSize);

    char buffer[1024];

    int bytesRecieved = recv(clientFD, buffer, sizeof(buffer) - 1, 0);

    buffer[bytesRecieved] = '\0';
    printf("%s", buffer);

    send(clientFD, buffer, bytesRecieved, 0);

    close(clientFD);
    close(serverFD);
    return 0;
}