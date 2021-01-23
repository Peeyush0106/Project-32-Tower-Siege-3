//In this game you have to shoot the cups and fall them off the tables. The game is simple. Just run this game, your will surely easily know what do you have to do in this. Hope you like it!

//Also see Commented Important.js to know what codes were commented and why are they important that they have been stored in a special separate file. They mostly contain the codes that were used to add restart function.

// A gmes creator,
// Peeyush

//Define gloabally used variables and constants.
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Constraint = Matter.Constraint;

var engine, world;

var leftCupsInRow;
var leftCupsInColumn;

var leftCups = [];
var rightCups = [];

var blocks, y_pos_spacer, x_pos_spacer, y_spaces, x_spaces;

var towerTable1, towerTable2, tower1, tower2;

var restartConditions;

var timesReset, score;

var canvasWidth, canvasHeight;

var myName;

var current_hour, bg_color;

var score;

function preload() {
    decide_background_according_to_current_time();
}

// Function for setting up basic objects and property values.
function setup() {
    //Canvas
    canvasWidth = 1200;
    canvasHeight = 600;
    createCanvas(canvasWidth, canvasHeight);

    //Matter.js physics engine setup
    engine = Engine.create();
    world = engine.world;

    //Creating the edges
    side_EdgesWidth = 10;
    topAndBottom_EdgesHeight = 10;
    rightEdge = new Edge(canvasWidth + (side_EdgesWidth / 2),
        canvasHeight / 2,
        side_EdgesWidth,
        canvasHeight);
    leftEdge = new Edge(0 - (side_EdgesWidth / 2),
        canvasHeight / 2,
        side_EdgesWidth, canvasHeight);
    topEdge = new Edge(canvasWidth / 2,
        0 - (topAndBottom_EdgesHeight / 2),
        canvasWidth,
        topAndBottom_EdgesHeight);
    bottomEdge = new Edge(canvasWidth / 2,
        canvasHeight + (topAndBottom_EdgesHeight / 2),
        canvasWidth,
        topAndBottom_EdgesHeight);

    //Creating out objects that are used in the game.
    //Ground
    ground = new Platform(600, height, 1200, 20);
    ground.body.isStatic = true;
    //The Catapult elevator
    elevation = new Platform(195, 520, 20, 140);
    //TowerTables
    towerTable1 = new Platform(675, 490, 250, 20);
    towerTable2 = new Platform(950, towerTable1.body.position.y - 150, 290, 10);
    //The Base of the Catapult. Created for the bird getting into the catapult otherwise.
    cataBase = new Platform(195, 420, 20, 60);
    //Polygon (The ball this is to be shot).
    polygon = new Polygon(190, 345, 20);
    //The slingshot rope to be stretched and released
    slingshot = new SlingShot(polygon.body, { x: 190, y: 320 });

    //Create the cup towers
    // tower1
    tower1 = createTower(25, 30, 675, 345, 5, leftCups);
    //tower2
    tower2 = createTower(25, 30, 955, 200, 5, rightCups);

    // Publisher
    myName = "Peeyush Agarwal - Also Called, Peeyush-The Debugger";
    // Initial score value
    score = 0;
}

//Function for creating tower of cups
function createTower(x_pos_spacer_para, y_pos_spacer_para, x_spaces_para, y_spaces_para, blocks_para, cupGroup) {
    x_pos_spacer = x_pos_spacer_para;
    y_pos_spacer = y_pos_spacer_para;

    x_spaces = x_spaces_para;
    y_spaces = y_spaces_para;

    blocks = blocks_para;

    // i is trying to confirm the number of blocks
    for (var i = 0; i < blocks; i++) {
        var y = y_spaces + (i * y_pos_spacer);
        var starCount = (i * 2) + 1;
        var x_start = x_spaces - (i * x_pos_spacer);
        //j is trying to confirm the number of stars in a block
        for (var j = 0; j < starCount; j++) {
            var x = x_start + (j * x_pos_spacer);
            cup = new Cup(x, y, 25, 30);
            cupGroup.push(cup);
        }
    }
}

//The draw that is the main brain for our code.
function draw() {
    //Background
    setBackground();
    //Matter.js engine update
    Engine.update(engine);
    //Illustration modes
    rectMode(CENTER);
    ellipseMode(RADIUS);
    imageMode(CENTER);
    angleMode(RADIANS);

    //Vanish the cups when they are off the tables
    vanishCups();

    //Propertie(s) used in our code
    towerTable2.body.position.y = towerTable1.body.position.y - 150;

    // Displaying objects created in our game
    ground.display();//Ground
    elevation.display("blue");//Elevation for catapult
    slingshot.displayImg1();//Slingshot
    polygon.display();//Hexagon ball that is thrown
    slingshot.displayImg3();//Slingshot's image 3, the holder for the hexagon ball
    slingshot.displayImg2();//Slingshot's image 2, the Base, and the right side bar of the catapult
    slingshot.displayLeftLine();//Slingshot's left line
    slingshot.displayRightLine();//Slingshot's right line
    towerTable1.display("green");//Tower table 1 display
    towerTable2.display("yellow");//Tower table 2 display
    //Display cup placed on the left side tower table
    for (var k = 0; k < leftCups.length; k++) {
        var cup = leftCups[k];
        cup.display("orange");
        cup.score();
    }
    //Display cup placed on the right side tower table
    for (var l = 0; l < rightCups.length; l++) {
        var cup = rightCups[l];
        cup.display("orange");
        cup.score();
    }

    //Conditional prgramming world enters
    //When the polygon's positions are meeting the required points and its speed it also considerably lower and nearby to stop, we will give another chance to the player
    if (polygon.body.velocity.x < 2
        && polygon.body.velocity.y < 2
        && polygon.body.velocity.x > -2
        && polygon.body.velocity.y > -2
        && polygon.body.position.x > 255) {
        reset();
    }
    //When the polygon went out of the screen, or went ahead of the catapult, we will give another chance to the player
    if (isOffScreen(polygon.body, polygon.radius, polygon.radius)) {
        reset();
    }

    //When the polygon went behind and belowe the catapult, we will give another chance to the player
    if (polygon.body.position.x < 190
        && polygon.body.position.y > 445) {
        reset();
    }

    //When the game can be restarted. In programming language, when the game can be reloaded and all objects position and other properties to be set in their defualt values
    //When the restart the game key is pressed
    if (keyDown("r")) {
        reloadPage();
    }

    // All the texts that are displayed in the game
    textSize(20);
    push();
    fill("white");
    rect(1022.5, 93.75, 200, 50);
    // Score
    fill("black");
    text('Your score: ' + score, 950, 100);
    fill(rgb(random(0, 255), random(0, 255), random(0, 255)));
    // Publisher
    text("Created by: " + myName, 100, 200);
    // When player has won the game
    if (score === 5000) {
        push();
        push();
        fill("black");
        rect(600, 300, 620, 100);
        pop();
        textSize(35);
        text("You win!!!! Press 'R' to start your game", 300, 315);
        pop();
    }
    // Instructions
    fill("red");
    text('Press "R" key to restart your game', 600, 550);
    pop();
}
//When the mouse is dragged over the object, the catapult strings should stretch
function mouseDragged() {
    if (slingshot.sling.bodyA != null && score < 5000) {
        Matter.Body.setPosition(polygon.body, { x: mouseX, y: mouseY });
    }
}

//When the mouse is released, the polygon should release
function mouseReleased() {
    if (slingshot.sling.bodyA != null && score < 5000) {
        slingshot.release();
    }
}

//When the game is be restarted
function reset() {
    Body.setPosition(polygon.body, { x: 190, y: 345 });
    slingshot.attach(slingshot.sling, polygon.body);
}

//Function to check if an object is not in the display area. It is out of the screen. In programming language, when the object x is greater than the max x of the display, or the x is smaller the the min x of the display, or the y of the object is greater then the max y, or the y is smaller then the min y of the display, the object is considered offScreen.
function isOffScreen(object, objectRequiredWidth, objectRequiredHeight) {
    return (
        object.position.x > width + (objectRequiredWidth / 2)

        || object.position.x < 0 - (objectRequiredWidth / 2)

        || object.position.y > height + (objectRequiredHeight / 2)

        || object.position.y < 0 - (objectRequiredHeight / 2));
}

//Restart the game
function reloadPage() {
    location.reload();
}

//Function for Cup Vanish Conditions
function vanishCups() {
    for (var m = 0; m < leftCups.length; m++) {
        var cup = leftCups[m];
        if (cup.body) {
            var cupPos = cup.body.position;
        }
        if (cupPos.y > 500
            || cupPos.x > 800
            || cupPos.x < 550
            || cup.body.speed.x > 5
            || cup.body.speed.y > 5) {
            cup.fadeAndVanish();
        }
    }

    for (var n = 0; n < rightCups.length; n++) {
        var cup = rightCups[n];
        var cupPos = cup.body.position;
        if (cupPos.y > 345
            || cupPos.x > 1095
            || cupPos.x < 805
            || cup.body.speed.x > 5
            || cup.body.speed.y > 5) {
            cup.fadeAndVanish();
        }
    }
}

// Asyncrhronous function that continues to function along with the rest of the code simultaneously as it takes time to load a few resources from the internet, it would slow down the operation and the game wouldn't function properly. So, we are waiting till the reqource loads and it becomes active after loading and the game works accordingly
async function decide_background_according_to_current_time() {
    // The URL for the resource
    var resource = await fetch("http://worldtimeapi.org/api/timezone/Asia/Kolkata");
    // The Resource in JSON format
    var resource_in_JSON = await resource.json();
    // The time of the day
    var dayTime = resource_in_JSON.datetime;
    // The time of day sliced from the resource
    var sliced_resource_hour = dayTime.slice(11, 13);
    // Global definition for current hour
    current_hour = sliced_resource_hour;
}

// Function for setting background
function setBackground() {
    // Variables to define the values to set the background
    const night_start = [19, 20];
    const night_end = [20, 6];
    const morning_start = [6, 10];
    const morning_end = [10, 12];
    const noon_start = [12, 14];
    const noon_end = [14, 16];
    const evening_start = [16, 17];
    const evening_end = [17, 19];

    const night_start_rgb = rgb(29, 142, 247);
    const night_end_rgb = rgb(0, 0, 255);
    const morning_start_rgb = rgb(21, 187, 242);
    const morning_end_rgb = rgb(237, 216, 30);
    const noon_start_rgb = rgb(237, 176, 45);
    const noon_end_rgb = rgb(247, 112, 49);
    const evening_start_rgb = rgb(164, 237, 80);
    const evening_end_rgb = rgb(29, 142, 247);

    var bakground_colour_choose;

    // Night
    // Night start
    if (current_hour >= night_start[0] && current_hour < night_start[1]) {
        bakground_colour_choose = night_start_rgb;
    }
    // Night end
    else if (current_hour >= night_end[0] && current_hour < night_end[1]) {
        bakground_colour_choose = night_end_rgb;
    }
    // Morniing
    // Moring start
    else if (current_hour >= morning_start[0] && current_hour < morning_start[1]) {
        bakground_colour_choose = morning_start_rgb;
    }
    // Morning end
    else if (current_hour >= morning_end[0] && current_hour < morning_end[1]) {
        bakground_colour_choose = morning_end_rgb;
    }
    // Noon
    // Noon start
    else if (current_hour >= noon_start[0] && current_hour < noon_start[1]) {
        bakground_colour_choose = noon_start_rgb;
    }
    // Noon end
    else if (current_hour >= noon_end[0] && current_hour < noon_end[1]) {
        bakground_colour_choose = noon_end_rgb;
    }
    // Evening
    // Evening start
    else if (current_hour >= evening_start[0] && current_hour < evening_start[1]) {
        bakground_colour_choose = evening_start_rgb;
    }
    // Evening end
    else if (current_hour >= evening_end[0] && current_hour < evening_end[1]) {
        bakground_colour_choose = evening_end_rgb;
    }
    // Set a default background unless the required one isn't loaded.
    if (bakground_colour_choose) {
        background(bakground_colour_choose);
    }
    else {
        background("white");
    }
}