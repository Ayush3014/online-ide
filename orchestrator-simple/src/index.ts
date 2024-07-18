import express from 'express';
import fs from 'fs';
import yaml from 'yaml';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  KubeConfig,
  AppsV1Api,
  CoreV1Api,
  NetworkingV1Api,
} from '@kubernetes/client-node';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();
const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

// utility function to handle multi-document YAML files
// const readAndParseKubeYaml = (filePath: string, replId: string): Array<any> => {
//   const fileContent = fs.readFileSync(filePath, 'utf8');
//   const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
//     let docString = doc.toString();
//     const regex = new RegExp(`service_name`, 'g');
//     docString = docString.replace(regex, replId);
//     console.log(docString);
//     return yaml.parse(docString);
//   });
//   return docs;
// };

const readAndParseKubeYaml = (filePath: string, replId: string): Array<any> => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
    let docString = doc.toString();
    const regex = new RegExp(`service_name`, 'g');
    docString = docString.replace(regex, replId);

    // Parse the YAML string
    let parsedDoc = yaml.parse(docString);

    // If it's an Ingress resource, add CORS annotations
    if (parsedDoc.kind === 'Ingress') {
      parsedDoc.metadata.annotations = {
        ...parsedDoc.metadata.annotations,
        'nginx.ingress.kubernetes.io/cors-allow-origin': '*',
        'nginx.ingress.kubernetes.io/cors-allow-methods':
          'GET, PUT, POST, DELETE, PATCH, OPTIONS',
        'nginx.ingress.kubernetes.io/cors-allow-headers':
          'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,Accept,Origin',
        'nginx.ingress.kubernetes.io/cors-allow-credentials': 'true',
      };
    }

    console.log(yaml.stringify(parsedDoc));
    return parsedDoc;
  });
  return docs;
};

// app.post('/start', async (req, res) => {
//   const { replId } = req.body; // assuming a unique identifier for each user
//   const namespace = 'default'; // assuming a default namespace

//   try {
//     const kubeManifests = readAndParseKubeYaml(
//       path.join(__dirname, '../service.yaml'),
//       replId
//     );

//     for (const manifest of kubeManifests) {
//       switch (manifest.kind) {
//         case 'Deployment':
//           await appsV1Api.createNamespacedDeployment(namespace, manifest);
//           break;
//         case 'Service':
//           await coreV1Api.createNamespacedService(namespace, manifest);
//           break;
//         case 'Ingress':
//           await networkingV1Api.createNamespacedIngress(namespace, manifest);
//           break;
//         default:
//           console.log(`Unsupported kind: ${manifest.kind}`);
//       }
//     }

//     res.status(200).send({ message: 'Resources created successfully' });
//   } catch (error) {
//     console.error('Failed to create resources: ', error);
//     res.status(500).send({ message: 'Failed to create resources' });
//   }
// });

app.post('/start', async (req, res) => {
  const { replId } = req.body;
  const namespace = 'default';

  try {
    const kubeManifests = readAndParseKubeYaml(
      path.join(__dirname, '../service.yaml'),
      replId
    );

    for (const manifest of kubeManifests) {
      try {
        switch (manifest.kind) {
          case 'Deployment':
            await appsV1Api.createNamespacedDeployment(namespace, manifest);
            break;
          case 'Service':
            await coreV1Api.createNamespacedService(namespace, manifest);
            break;
          case 'Ingress':
            await networkingV1Api.createNamespacedIngress(namespace, manifest);
            break;
          default:
            console.log(`Unsupported kind: ${manifest.kind}`);
        }
      } catch (error) {
        console.error(`Failed to create ${manifest.kind}: `, error);
        throw error;
      }
    }

    res.status(200).send({ message: 'Resources created successfully' });
  } catch (error) {
    console.error('Failed to create resources: ', error);
    res
      .status(500)
      .send({ message: 'Failed to create resources', error: error });
  }
});

const port = 3002;
app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
