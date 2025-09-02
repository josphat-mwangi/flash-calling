## Getting Started

Installing the dependencies:

```bash
yarn install
# or
npm install
```



env file

```
USERNAME=your_africastalking_username
API_KEY=your_africastalking_api_key
CALLER_ID=your_verified_caller_id
PORT=3000
```

Starting the server:

```bash
node index.js
or 
yarn run dev # development with nodemon
or
yarn start # production
```
server will run on `http://localhost:3000` or the port specified in the `.env` file.

## API Endpoints    

- `POST /api/flash-call/initiate`: Initiates a flash call to the specified phone number. Expects a JSON body with a `phoneNumber` field.
- `POST /api/flash-call/verify`: Verifies the code entered by the user. Expects a JSON body with `sessionId` and `code` fields.


## Flash Call Authentication Flow
1. User initiates a flash call by providing their phone number.
2. The server generates a random 4-digit verification code.
3. The server modifies the caller ID to include the verification code in the last 4 digits.
4. The server makes a flash call to the user's phone number using Africa's Talking Voice API.
5. The user sees the modified caller ID and notes the verification code.
6. The user enters the verification code into the application.




