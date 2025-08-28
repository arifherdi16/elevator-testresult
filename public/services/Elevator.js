class Elevator {
  constructor(mans, config) {
    this.canvas = config['canvas'];
    this.ctx = config['ctx'];
    this.totalFloors = config['totalFloors'];
    this.floorHeight = config['floorHeight'];
    this.elevatorWidth = config['elevatorWidth'];
    this.elevatorHeight = config['elevatorHeight'];
    this.speed = config['speed'] || 0.2;
    
    this.elvParams = [];
    this.reservedFloor = new Set();

    this.mans = mans;

    this.elevatorsCount = this.mans.length;
    this.elevators = Array.from({ length: this.elevatorsCount }, (_, i) => ({
      id: i,
      currentFloor: 0,
      targetFloor: 0,
    }));
    
    this.startTime = new Date();
    this.finishTime;

    this.deliveredCount = 0;
    this.timeNeeded = 0;
    
  }

  setElevatorParams(idx, params) {
    this.elvParams[idx] = params;
  }

  getElevatorParams(idx) {
    return this.elvParams[idx] || [];
  }

  clearElevatorParams(idx) {
    this.elvParams[idx] = [];
  }

  run() {
    let completed = 0;
    const totalMans = this.mans.length;
    this.mans.forEach((man, i) => {
      const assignedElevator = i % this.elevators.length;
      this.go(assignedElevator, man, () => {
        completed++;
        if (completed == this.mans.length) {
          this.handleElevatorCompletion();
        }
      });
    });
  }

  go(idx, man, cb) {
    const elv = this.elevators[idx];

    if (this.isFloorReserved(man.from)) {
      console.log(`Floor conflict at ${man.from}, skipping pickup for elevator ${idx + 1}`);
      this.goToDestination(idx, man, cb);
      return;
    }

    this.reserveFloor(man.from);
    elv.targetFloor = man.from - 1;

    this.setElevatorParams(idx, [(elv) => {
      setTimeout(() => {
        this.unreserveFloor(man.from);
        this.goToDestination(idx, man, cb);
      }, 2000);
    }]);

    this.animateElevatorByIndex(idx);
  }

  goToDestination(idx, man, cb) {
    const elv = this.elevators[idx];

    if (this.isFloorReserved(man.to)) {
      console.log(`Floor conflict at ${man.to}, skipping drop-off for elevator ${idx + 1}`);

      this.goToFirstFloor(idx, cb);
      return;
    }

    this.reserveFloor(man.to);
    elv.targetFloor = man.to - 1;

    this.clearElevatorParams(idx);
    this.setElevatorParams(idx, [(el) => {
      if ((man.to - 1) === el.currentFloor) {
        this.updateDeliverCount(1);
      }
      this.unreserveFloor(man.to);

      setTimeout(() => {
        this.goToFirstFloor(idx, cb);
      }, 2000);
    }]);

    this.animateElevatorByIndex(idx);
  }

  goToFirstFloor(idx, cb) {
    const elv = this.elevators[idx];
    elv.targetFloor = 0;

    this.clearElevatorParams(idx);
    this.setElevatorParams(idx, [function () {
      if (typeof cb === "function") {
        setTimeout(cb, 2000);
      }
    }]);

    this.animateElevatorByIndex(idx);
  }
  
  drawElevator() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw floors and floor numbers
    this.ctx.fillStyle = 'black';
    for (let i = 0; i < totalFloors; i++) {
      const yPosition = this.canvas.height - (i + 1) * this.floorHeight;
      this.ctx.fillText(`Floor ${i+1}`, 10, yPosition + this.floorHeight - 2);
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, yPosition);
      this.ctx.lineTo(canvas.width, yPosition);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(1050, yPosition)  
      this.ctx.lineTo(1050, yPosition + canvas.height)
      this.ctx.stroke();
    }

    let gapBetween = 0;

    for (let idx = 0; idx < this.elevators.length; idx++) {
      if (idx > 0) {
        gapBetween = idx * 10;
      }
      const pos = 55 + gapBetween;
      const obj = this.elevators[idx];
      this.drawElevatorBox(pos,this.canvas.height - (obj.currentFloor + 1) * floorHeight + (floorHeight - elevatorHeight), elevatorWidth, elevatorHeight)
      const yWait = this.canvas.height - (obj.targetFloor) * floorHeight - 2;
      this.ctx.fillText('Waiting', 1075, yWait);
      this.ctx.stroke()
    }
  }

  drawElevatorBox(xPos, yPos, wVal, hVal) {
    ctx.fillStyle = 'red';
    ctx.fillRect(xPos, yPos, wVal, hVal);
  }

  animateElevator(idx, cb) {
    const obj = this.elevators[idx];
    
    obj.state = 1;

    if (obj.currentFloor < obj.targetFloor) {
      let gap = obj.targetFloor - obj.currentFloor;
      let inLinear = parseInt(obj.targetFloor / 5)
      if (gap < 5) {
        obj.currentFloor += this.speed;
      } else if (obj.currentFloor === 0 && obj.currentFloor <= inLinear) {
        obj.currentFloor += this.speed;
      } else if (obj.currentFloor > 0 && (obj.currentFloor - 5) < inLinear) {
        obj.currentFloor += this.speed;
      } else {
        obj.currentFloor += this.speed * 2;
      }
      if (obj.currentFloor > obj.targetFloor) {
        obj.currentFloor = obj.targetFloor
      };
    } else if (obj.currentFloor > obj.targetFloor) {
      let gap = (obj.currentFloor - obj.targetFloor)
      if (obj.previousFloor > 0) {
        let inLinear = parseInt(obj.previousFloor/ 5)
        if (gap < 5) {
          obj.currentFloor -= this.speed;
        } else if (obj.currentFloor > parseInt(inLinear * 5)) {
          obj.currentFloor -= this.speed;
        } else {
          obj.currentFloor -= this.speed * 2;
        }
      } else {
        if (gap < 5) {
          obj.currentFloor -= this.speed;
        } else {
          obj.currentFloor -= this.speed * 2;
        }
      }

      if (obj.currentFloor < obj.targetFloor) {
        obj.currentFloor = obj.targetFloor;
      }
    }
    
    this.drawElevator();

    if (obj.currentFloor !== obj.targetFloor) {
      obj.animationId = requestAnimationFrame(() => this.animateElevatorByIndex(idx));
    } else {
      obj.previousFloor = obj.currentFloor;
      cancelAnimationFrame(obj.animationId);

      obj.state = 0;
      if (typeof cb === 'function') cb(obj);
    }
  }

  animateElevatorByIndex(idx) {
    this.animateElevator(idx, ...this.getElevatorParams(idx));
  }

  updateDeliverCount(v) {
    if (v !== undefined && v > 0) this.deliveredCount += v;

    document.getElementById("startTime").innerHTML = this.startTime.toLocaleString();
    if (this.finishTime) {
      const gapTime = Math.floor((this.finishTime - this.startTime) / 1000);
      document.getElementById("finishTime").innerHTML = this.finishTime.toLocaleString();
      document.getElementById("gapTime").innerHTML = `${gapTime} seconds`;
    }
    document.getElementById("counter").innerHTML = this.deliveredCount;
  }

  isFloorReserved(floor) {
    return this.reservedFloor.has(floor);
  }

  reserveFloor(floor) {
    this.reservedFloor.add(floor)
  }

  unreserveFloor(floor) {
    this.reservedFloor.delete(floor)
  }

  handleElevatorCompletion() {
    this.finishTime = new Date();
    this.updateDeliverCount();
  }
}