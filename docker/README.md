## OpenVidu Call docker

OpenVidu bases its deployment on Docker **since 2.13.0 version**.

####  release.dockerfile

The aim of this docker file is generate a docker image from OpenVidu Call release.

To build it:

```bash
docker build -f release.dockerfile -t <your-tag-name> --build-arg RELEASE=2.13.0 .
```

####  master.dockerfile

The aim of this docker file is generate a docker image from OpenVidu Call dev.

To build it:

```bash
docker build -f master.dockerfile -t <your-tag-name> .
```

