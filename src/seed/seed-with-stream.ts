import {connectDB, closeDB} from '../db/connection';
import User from '../db/user.model';
import {faker} from '@faker-js/faker';
import {Readable} from 'stream';

function generateUserStream(totalUsers: number){
    let count = 0;
    return new Readable({
        objectMode: true,
        read(){
            if(count>= totalUsers){
                this.push(null);
                count++;
            }
            const user ={
                name: faker.internet.username(),
                company: faker.company.name(),
                dateBirth: faker.date.past(),
                password: faker.internet.username()+ faker.company.name(),
                createdAt: faker.date.past({
                    years:10,
                    refDate: new Date()
                }),
                updatedAt: faker.date.past({
                    years:9,
                    refDate: new Date()
                }),
                lastPasswordUpdateAt: faker.date.past({
                    years:9,
                    refDate: new Date()
                })
            }
            count ++;
            this.push(user);
        }
    })
}

async function insertUserStream(totalUsers:number){
    const userStream= generateUserStream(totalUsers);
    const batchSize = 1000;
    let batch = [];
    for await (const user of userStream){
        batch.push(user);
        if(batch.length >= batchSize){
            try{
                await User.bulkCreate(batch);
                console.log(`Batch of ${batchSize} users inserted successfully.`);
                batch = [];
            } catch (error) {
                console.error("Error inserting batch of users:", error);
            }
        }
        
    }
    if(batch.length > 0){
        try {
            await User.bulkCreate(batch);
            console.log(`Final batch of ${batch.length} users inserted successfully.`);
        } catch (error) {
            console.error("Error inserting final batch of users:", error);
        }
    }

}

(async()=>{
    await connectDB();
    console.time("seed-stream");
    await insertUserStream(200_000);
    console.timeEnd("seed-stream");
    await closeDB();
})()

// npx ts-node-dev src/seed/seed-with-stream.ts