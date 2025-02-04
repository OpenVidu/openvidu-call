# OpenVidu Embedded API client for TypeScript


## Build

This client is automatically generated from the OpenVidu Call Embedded API. To build it, you neeed to follow these steps:

1. Go the OpenVidu Call backend and install the dependencies:

```bash
cd backend
npm install
```

2. Run the generate script:

```bash
npm run generate:embedded-ts-client
```

3. The source code will be generated in the `sdk/client-ts` folder.

4. Build the client:

```bash
cd sdk/client-ts
npm install
npm run package
```

This will generate a npm package in the `sdk/client-ts` folder.


