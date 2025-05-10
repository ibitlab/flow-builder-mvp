# Project Documentation

This project includes several npm scripts to help with various development tasks. Below is a breakdown of the available commands and how to use them.

## Scripts

- **start**: `npm run start`
  - Runs the development server by aliasing the `dev` script.
- **dev**: `webpack serve --config webpack.dev.js`
  - Starts the Webpack development server using the development configuration.
- **build**: `webpack --config webpack.prod.js`
  - Builds the project for production using the production configuration.
- **prepare**: `husky`
  - Sets up Husky to manage Git hooks automatically.
- **lint**: `eslint --ext .js,.ts src`
  - Lints all JavaScript and TypeScript files in the `src` directory.
- **lint:watch**: `eslint --ext .js,.ts src --watch`
  - Automatically lints files when changes are detected.
- **lint:fix**: `eslint --ext .js,.ts src --fix`
  - Automatically fixes linting issues where possible.
- **format**: `prettier --write .`
  - Formats all supported files using Prettier.

## Usage

### Development Mode

To start the development server, run:

```sh
npm run start
```

This command runs the `dev` script, which uses the `webpack.dev.js` configuration to start the server.

### Production Build

To generate a production-ready bundle, run:

```sh
npm run build
```

This command uses the `webpack.prod.js` configuration to build an optimized production bundle.

### Linting and Formatting

You can maintain code quality with the following commands:

- Lint your code:
  ```sh
  npm run lint
  ```

````
- Watch files for linting:
  ```sh
npm run lint:watch
````

- Automatically fix lint issues:
  ```sh
  npm run lint:fix
  ```

````
- Format your code using Prettier:
  ```sh
npm run format
````

## Additional Instructions

Before running any scripts, ensure you have installed all dependencies using:

```sh
npm install
```

Also, the `prepare` script sets up Husky for Git hooks to enforce code quality during commits.

Happy coding!
