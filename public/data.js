const mansTotal = 100;
const minFloorNumber = 3;
const maxFloorNumber = 50;

let mans = [];

for (let index = 0; index < mansTotal; index++) {
  let from, to;

  do {
    from = generateRandomFloorNumber();
    to = generateRandomFloorNumber();
  } while (from === to); //avoid number duplication
  mans[index] = {from, to};
}

function generateRandomFloorNumber() {
  return Math.floor(Math.random() * (maxFloorNumber - minFloorNumber + 1)) + minFloorNumber;
}