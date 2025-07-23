import {connectDB, closeDB} from '../db/connection';
import User from '../db/user.model';
import {da, faker} from '@faker-js/faker';

function generateUser(){
    return{
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
}

// async function seedUser(){
//     try{
//         for(let i=0; i<200_000; i++){
//             const user = generateUser();
//             await User.create(user);
//         }
//         console.log("Users seeded successfully.");
//     }
//     catch(error){
//         console.error("Error seeding users:", error);
//     }
// }


async function seedUser(){
    const batchSize = 1000;
    try{
        for(let i=0; i<200_000; i+= 1000){
            const batch = Array.from({length: batchSize}, () => generateUser());
            // await Promise.all(batch.map(user => User.create(user)));
            await User.bulkCreate(batch);
            console.log(`Batch ${i+batchSize} seeded successfully.`);
        }
        console.log("Users seeded successfully.");
    }
    catch(error){
        console.error("Error seeding users:", error);
    }
}
(async()=>{
    await connectDB();
    console.time("seed-db");
    await seedUser();
    console.timeEnd("seed-db");
    await closeDB();
})()