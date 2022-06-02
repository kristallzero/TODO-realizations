# Simple TODO
This project was written with express js 

This is my first implementation of a synced TODO list — Simple TODO

# Features 
- Every task will be saved on the server
- All tasks can be editted/deleted/marked as done
- Every task can contain subtasks

# Starting up
- `npm install` / `npm i` - install all dependencies
- Before starting server, please create file index.js in the folder keys and type that keys:<br>
```js
export default {
  MONGODB: 'MongoDB database url',
  defaultUserID: 'After first startup, new user will be created, insert here his ID'
}
```

- `npm run start` - run server using node
- `npm run dev` - run server using nodemon (hot rebuild)
