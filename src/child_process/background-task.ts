import ValidatedUser from "../db/validated-users.model";

process.on("message", async ({user})=>{
    try{
        await ValidatedUser.create(user);
        if(process.send) process.send({status: "done", count:1})
    }catch(error: any){
        console.error(`Error ao inserir usuário: ${error.message}`)
        if(process.send) process.send({status: "error", message: error.message})
    }
})
