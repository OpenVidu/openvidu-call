## OpenVidu Call docker

OpenVidu bases its deployment on Docker **since 2.13.0 version**.

####  release.dockerfile

The aim of this docker file is generate a docker image from a OpenVidu Call release.

To build it:

```bash
docker build -f release.dockerfile -t <your-tag-name> --build-arg RELEASE=2.13.0 .
```

####  branch.dockerfile

The aim of this docker file is generate a docker image from a OpenVidu Call branch.

To build it:

```bash
docker build -f branch.dockerfile -t <your-tag-name> --build-arg BRANCH=<branch-name> .
```

By default, the branch name will be `master`.

