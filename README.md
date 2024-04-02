# React POS

## Initial Setup

Your machine should already have NodeJS, npm, git and Yarn installed and a code editor.

To get started:

- Clone repo onto your local machine
- While in the project folder, run `yarn`. This will install all of the dependencies.
- To run the project locally use the command `yarn start`. The project will run on [http://localhost:3000](http://localhost:3000).

## Contributing

Please create a new branch (`git checkout -b [branch-name]`) before changing any code.

Use `yarn test` to test the project. You can run unit tests (`yarn unit`) or end-to-end tests (`yarn e2e`) individually as well.

When you are ready to commit a change run:

- `git add .` or you can add files individually `git add [file.js]`
- `yarn cm` this will start a command line tool to help you craft a good commit message
- `git push origin [branch-name]` this will push your branch to the main repo in Azure DevOps

In Azure DevOps, create a pull request by navigating to the repo page and clicking the "Create a pull request" message that should be displayed near the top of the page.

## API Call Sequence

- Web entry at `src/index.js`
- `src/Main.js` (where react router and redux provider are added)
- src/routes/Routes.js
  - On Mount: `StoreActions.fetchStoreInfo()` and `AssociateActions.fetchAssociateData()`
  - `StoreActions.fetchStoreInfo()` calls `CoordinatorAPI.getStoreInfo()` (coordinator/configuration) and saves data to Redux store. If the call is successful, then `RegisterActions.fetchRegisterData()` is called.
  - `AssociateActions.fetchAssociateData()` checks Local/Async Storage for associate data and saves to Redux store. If no data is found, authenticated is set to false in the Redux store.
  - `RegisterActions.fetchRegisterData()` calls `CoordinatorAPI.getRegisterData()` (coordinator/Register/RegisterNumber/{storeNum}/host) and `TransactionActions.checkForActiveTransaction()` if there is no register number in storage. Otherwise it saves the existing register data in storage to the redux store and calls `TransactionActions.checkForActiveTransaction()`
  - `TransactionActions.checkForActiveTransaction()`
  - Documentation in progress

## Helpful Links

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
