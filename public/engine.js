const canvas = document.getElementById('elevatorCanvas');
const ctx = canvas.getContext('2d');

const totalFloors = 50;
const floorHeight = 14; 
const elevatorWidth = 5;
const elevatorHeight = 13;
const speed = 0.3;

let config = [];

config = {canvas, ctx, totalFloors, floorHeight, elevatorHeight, elevatorWidth, speed};

const elevator = new Elevator(mans, config);
elevator.run();
