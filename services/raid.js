// TODO: 파일 이름 수정 예정
const pool2 = require("../db/redisConfig");
const redis = require("redis");

async function run() {
  const client = redis.createClient(pool2);
  await client.connect();
  // example - 지워주세요
  // const value = await client.get("a");
  // console.log(value);
  console.log("Redis Server Opened??:", client.isOpen);
  //await client.disconnect(); - 닫아야할 때 닫아주세요
}

run();
