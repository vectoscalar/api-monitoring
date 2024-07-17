# api-monitoring

# Installation and Usage

## Library Repository
## Install Dependencies:

Navigate to the library repository.
Run `npm install` to install the required dependencies.

# Server Directory
## Install Dependencies:

Navigate to the server directory.
Run `npm install` to install the necessary dependencies for your server.
Install ts-node (if not already installed):
If you haven’t installed ts-node, do so globally using `npm install -g ts-node`.

# Outer Repository (Linking the Plugin)

## Link the Plugin:
In the outer repository (where your server and library reside), run `npm link`.
This command creates a symbolic link for your plugin.

Link Your Fastify Plugin:
Run `npm link 'my-fastify-plugin'` 
This step ensures that your server can use the locally linked plugin.

Run Your Server:
Execute `ts-node` server to start your server. 