## Online IDE using AWS EKS Cluster

This project is an online Integrated Development Environment (IDE) using an AWS EKS cluster. It involves the following services:
- **Frontend**: User interface for the IDE
- **Backend**: Handles backend operations
- **Init Service**: Initializes and prepares the environment for the user
- **Orchestrator Simple**: Manages Kubernetes resources for each user session
- **Runner**: Executes user-written code in isolated environments

### Workflow
1. **User Action**: The user selects a programming language (e.g., Node.js) and an ID (e.g., test5) on the frontend.
2. **Init Service**: The request goes to the Init Service, which creates a folder named after the ID (e.g., test5) and copies the base code into this folder. The frontend shows a "booting" status.
3. **Orchestrator Simple**: The frontend sends a request to `localhost:3002/start`. The Orchestrator Simple service handles this request, running a service YAML file to create a deployment, service, and ingress for the user with the given ID (e.g., test5). It also installs the runner image (deployed on Docker Hub) in the pods.
4. **IDE Interface**: After these steps, the user will see a frontend interface similar to an IDE.

### Domain Configuration
- Two domains: `mydomain1.online` and `mydomain2.online`
- Both domains have the same CNAME record configured in Hostinger:
  - **Type**: CNAME
  - **TTL**: 3600
  - **Points to**: External IP of the load balancer service (e.g., `*.mydomain1.online`)

### Initialization Steps

1. **Start the EKS Cluster**:
    

2. **Create Node Group**:
    

3. **Update kubeconfig**:
    ```sh
    aws eks update-kubeconfig --region <region-name> --name <cluster-name>
    ```

4. **Create Namespace for Ingress NGINX**:
    ```sh
    kubectl create namespace ingress-nginx
    ```

5. **Deploy Ingress Controller**:
    ```sh
    cd k8s
    kubectl apply -f ingress-controller.yaml
    ```

6. **Update Security Group for ELB**:
     Allow ICMP traffic for the security group associated with the EKS load balancer (e.g., `k8s-elb`).

7. **Get Load Balancer External IP**:
    ```sh
    kubectl get svc -n ingress-nginx
    ```

8. **Update Domain Records**:
     Update the external IP in the DNS settings for both domains and test connectivity with `ping`.

9. **Start Services**:
    - **Frontend**
    - **Init Service**
    - **Orchestrator Simple**

### File Structure

```plaintext
├── frontend
├── backend
├── init-service
├── orchestrator-simple
├── k8s
│   └── ingress-controller.yaml
├── runner
└── README.md
```

### Notes
- Ensure the runner image is properly deployed in Docker Hub and accessible by the EKS cluster.
- The service YAML files should be configured correctly to create the necessary Kubernetes resources (deployments, services, ingresses) for each user session.
- Regularly update and monitor the DNS settings to ensure the CNAME records point to the correct external IP.

### Troubleshooting
- If the services do not start correctly, check the logs for each service.
- Verify that the Kubernetes resources are created as expected using `kubectl get pods`, `kubectl get svc`, and `kubectl get ingress`.
- Ensure that the security group rules are properly configured to allow traffic to the load balancer.

---
