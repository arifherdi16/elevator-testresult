const canvas = document.getElementById('elevatorCanvas');
const ctx = canvas.getContext('2d');
const elevatorInput = document.getElementById('elevatorInput');
const floorInput = document.getElementById('floorInput');
const requestButton = document.getElementById('requestButton');

const totalFloors = 50;
const floorHeight = 14; 
const elevatorWidth = 5;
const elevatorHeight = 13;

const elevatorsCount = mans.length;
let elevators = Array.from({ length: elevatorsCount }, (_, i) => ({
  id: i,
  currentFloor: 0,
  targetFloor: 0,
}));

let startTime = new Date();
let finishTime;

let deliveredCount = 0;
let timeNeeded = 0;

updateDeliverCount();

function drawElevator() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw floors and floor numbers
  ctx.fillStyle = 'black';
  for (let i = 0; i < totalFloors; i++) {
    const yPosition = canvas.height - (i + 1) * floorHeight;
    ctx.fillText(`Floor ${i+1}`, 10, yPosition + floorHeight - 2);
    
    ctx.beginPath();
    ctx.moveTo(0, yPosition);
    ctx.lineTo(canvas.width, yPosition);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1050, yPosition)  
    ctx.lineTo(1050, yPosition + canvas.height)
    ctx.stroke();
  }

  let gapBetween = 0;

  for (let idx = 0; idx < elevators.length; idx++) {
    if (idx > 0) {
      gapBetween = idx * 10;
    }
    const pos = 55 + gapBetween;
    const obj = elevators[idx];
    drawElevatorBox(pos,canvas.height - (obj.currentFloor + 1) * floorHeight + (floorHeight - elevatorHeight), elevatorWidth, elevatorHeight)
    const yWait = canvas.height - (obj.targetFloor) * floorHeight - 2;
    ctx.fillText('Waiting', 1075, yWait);
    ctx.stroke()
  }
}

function drawElevatorBox(xPos, yPos, wVal, hVal) {
  ctx.fillStyle = 'red';
  ctx.fillRect(xPos, yPos, wVal, hVal);
}

function animateElevator(idx, cb) {
  const obj = elevators[idx];

  obj.state = 1;

  if (obj.currentFloor < obj.targetFloor) {
    let gap = obj.targetFloor - obj.currentFloor;
    let inLinear = parseInt(obj.targetFloor / 5)
    if (gap < 5) {
      obj.currentFloor += 0.1;
    } else if (obj.currentFloor === 0 && obj.currentFloor <= inLinear) {
      obj.currentFloor += 0.1
    } else if (obj.currentFloor > 0 && (obj.currentFloor - 5) < inLinear) {
      obj.currentFloor += 0.1;
    } else {
      obj.currentFloor += 0.2;
    }
    if (obj.currentFloor > obj.targetFloor) {
      obj.currentFloor = obj.targetFloor
    };
  } else if (obj.currentFloor > obj.targetFloor) {
    let gap = (obj.currentFloor - obj.targetFloor)
    if (obj.previousFloor > 0) {
      let inLinear = parseInt(obj.previousFloor/ 5)
      if (gap < 5) {
        obj.currentFloor -= 0.1;
      } else if (obj.currentFloor > parseInt(inLinear * 5)) {
        obj.currentFloor -= 0.1;
      } else {
        obj.currentFloor -= 0.2;
      }
    } else {
      if (gap < 5) {
        obj.currentFloor -= 0.1;
      } else {
        obj.currentFloor -= 0.2;
      }
    }

    if (obj.currentFloor < obj.targetFloor) {
       obj.currentFloor = obj.targetFloor;
    }
  }
  
  drawElevator();

  if (obj.currentFloor !== obj.targetFloor) {
    obj.animationId = requestAnimationFrame(() => animateElevatorByIndex(idx));
  } else {
    obj.previousFloor = obj.currentFloor;
    cancelAnimationFrame(obj.animationId);

    obj.state = 0;
    if (typeof cb === 'function') cb(obj);
  }
}

function updateDeliverCount(v) {
  if (v !== undefined && v > 0) {
    deliveredCount += v;
  }
  document.getElementById("startTime").innerHTML = startTime.toLocaleString();
  
  if (finishTime) {
    document.getElementById("finishTime").innerHTML = finishTime.toLocaleString();
    document.getElementById("gapTime").innerHTML = getDateTimeSince(startTime);
  }

  document.getElementById("counter").innerHTML = deliveredCount;
}

let elvParams = [];

function setElevatorParams(idx, params) {
  elvParams[idx] = params;
}

function getElevatorParams(idx){
  return elvParams[idx] || [];
}

function clearElevatorParams(idx) {
  elvParams[idx] = [];
}

function animateElevatorByIndex(idx) {
  animateElevator.apply(null, [idx, ...getElevatorParams(idx)])
}

let reservedFloor = new Set();

function go(idx, man, cb) {
  const elv = elevators[idx];

  if (reservedFloor.has(man.from)) {
    console.log(`Floor conflict at ${man.from}, skipping pickup for elevator ${idx + 1}`);
    goToDestination(idx, man, cb);
    return;
  }

  reservedFloor.add(man.from);
  elv.targetFloor = man.from - 1;

  setElevatorParams(idx, [function (elv) {
    setTimeout(() => {
      reservedFloor.delete(man.from);
      goToDestination(idx, man, cb);
    }, 2000);
  }]);

  animateElevatorByIndex(idx);
}

function goToDestination(idx, man, cb) {
  const elv = elevators[idx];

  if (reservedFloor.has(man.to)) {
    console.log(`Floor conflict at ${man.to}, skipping drop-off for elevator ${idx + 1}`);

    goToFirstFloor(idx, cb);
    return;
  }

  reservedFloor.add(man.to);
  elv.targetFloor = man.to - 1;

  clearElevatorParams(idx);
  setElevatorParams(idx, [function (el) {
    if ((man.to - 1) === el.currentFloor) {
      updateDeliverCount(1);
    }
    reservedFloor.delete(man.to);

    setTimeout(() => {
      goToFirstFloor(idx, cb);
    }, 2000);
  }]);

  animateElevatorByIndex(idx);
}

function goToFirstFloor(idx, cb) {
  const elv = elevators[idx];
  elv.targetFloor = 0;

  clearElevatorParams(idx);
  setElevatorParams(idx, [function () {
    if (typeof cb === "function") {
      setTimeout(cb, 2000);
    }
  }]);

  animateElevatorByIndex(idx);
}

function runAll() {
  let completed = 0;
  const totalMans = mans.length;
  mans.forEach((man, i) => {
    const assignedElevator = i % elevators.length;
    go(assignedElevator, man, () => {
      completed++;
      if (completed == mans.length) {
        handleElevatorCompletion();
      }
    });
  });
  
}

function handleElevatorCompletion() {
  finishTime = new Date();
  updateDeliverCount();
}

runAll();

