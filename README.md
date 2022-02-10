# Simple TODO
This project was written with express js 

This is my first implementation of a synced TODO list — Simple TODO

# Features 
- Every task will be saved on the server-side
- All tasks could be able to edit/delete/mark as done
- To update the TODO list, update page

# Starting up
- `npm install` / `npm i` - install all dependencies
- Before starting server, please create file index.js in folder keys and type that keys:<br>
`export default { ` <br>
`MONGODB: <MongoDB database url>,`<br>
`defaultUserID: <After first startup, new user will be created, insert here his ID> `<br>
`}`
- `npm run start` - run server using node
- `npm run dev` - run server using nodemon
