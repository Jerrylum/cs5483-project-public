# Cloudflared

This directory contains setup for Cloudflare Tunnel, a service that creates a secure connection between our application and the Cloudflare network, such that we can access our application from anywhere.

## Creating a New Cloudflare Tunnel

Follow these steps to create a new tunnel on the Cloudflare website:

1. **Log in to your Cloudflare account**
   - Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/) and sign in

2. **Navigate to Zero Trust**
   - Click on "Zero Trust" in the sidebar menu
   - If you haven't set up Zero Trust yet, you'll need to follow the onboarding process

3. **Access Tunnels**
   - In the Zero Trust dashboard, click on "Networks" in the left sidebar
   - Select "Tunnels" from the submenu

4. **Create a new tunnel**
   - Click the "Create a tunnel" button
   - Give your tunnel a descriptive name
   - Click "Save tunnel"

5. **Input the tunnel token**
   - Copy the tunnel token and paste it as the value for `CLOUDFLARE_TUNNEL_TOKEN` in the `.env` file

6. **Configure the tunnel**
   - Add a public hostname that will route traffic to your service
   - Specify the service type and URL (e.g., HTTP, SSH, RDP)
   - Configure additional settings as needed
   - Click "Save" to apply the configuration

7. **Test the connection**
   - Once the tunnel is running, test the connection by accessing the service through the Cloudflare hostname

## Additional Resources

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflared GitHub Repository](https://github.com/cloudflare/cloudflared)
- [Cloudflare Zero Trust Documentation](https://developers.cloudflare.com/cloudflare-one/)
