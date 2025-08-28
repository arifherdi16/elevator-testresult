# Elevator Test
1. Modify the code to be more readable.
2. Try to convert to object oriented, simplicity & reusability is the main point.
3. Currently, the elevator would run one-by-one, solve the code so those 3 elevator can serve the in a parallel way without conflicting each other when serving on the same floor (1 floor 1 elevator).
4. Fix incorrect Person floor position with the "Waiting" text, that must be a waiting person on specific floor, ready to pickup.
5. Create loop 100x for elevators serve more people with random floor and random destination, the destination must different than the source floor
6. Optimize the number of people served by elevator, e.g. move faster and smooth without removing the animation.
7. When serve finished, move back the elevator to 1st floor
8. Shorter time to serve is better.

# Test Result
1. Some functions are modified to be more readable, (go, goToDestination, goToFirstFloor, etc).
2. Created a Class to handle the Elevator functions, running a class inside a "engine.js" with initial configuration. 
3. The elevator runs by parallel instead of sequential, without any conflicted each other when serving on the same floor (1 floor 1 elevator). The conflicted floor is logged at browser console log
4. "Waiting" text has been fixed with a correct position based on served floor.
5. Created a "for-loop" until 100x to generate an elevator mans along with number of elevators.
6. Increased the speed of elevator movement to serve many people with a short time, and can be configurable at engine.js
7. The elevators will back to the forst floor when the serve has been finished.
8. The time of serve has been decreased along with point 6. 

