let app = require("express")();
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//Creating middleware to handle POST request
app.use(express.json());
app.use(express.urlencoded());
let mongoose = require("mongoose");
mongoose.Promise = global.Promise;
let port = 9090;

let url = "mongodb://localhost:27017/meanstack";
let mongooseDbOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

let storeCourseHtml = `
<div>
    <form action="http:localhost:9090/storeCourse" action="post">
        <label>Course ID: </label>
        <input type="text" name="_id"/><br/>
        <label>Course Name: </label>
        <input type="text" name="courseName"/><br/>
        <label>Course Description: </label>
        <input type="text" name="courseDescription"/><br/>
        <label>Amount: </label>
        <input type="text" name="amount"/><br/>
        <input type="submit" value="Add Course"/>
        <input type="reset" value="Reset"/>
    </form>
</div>
`;

let deleteCourseHtml = `
<div>
    <form action="http:localhost:9090/deleteCourse/$(#_id)" action="post">
        <label>Course ID: </label>
        <input type="text" name="_id"/><br/>
        <input type="submit" value="Delete"/>
    </form>
</div>
`;

let updateCourseHtml = `
<div>
    <form action="http:localhost:9090/updateCourse/$(#_id)" action="post">
        <label>Course ID: </label>
        <input type="text" name="_id"/><br/>
        <label>Amount: </label>
        <input type="text" name="amount"/><br/>
        <input type="submit" value="Update"/>
    </form>
</div>
`;
// create html table data variable
let courseTableHtml = `
<div>
    <table border="1">
        <tr>
            <th>Course ID</th>
            <th>Course Name</th>
            <th>Course Description</th>
            <th>Amount</th>
        </tr>
        <tr>
`;

mongoose.connect(url, mongooseDbOption);
let db = mongoose.connection;


//Define the schema
let CourseSchema = mongoose.Schema({
    _id:Number,
    courseName:String,
    courseDescription:String,
    amount:Number
});
//Creating Model using schema
let Course = mongoose.model("", CourseSchema, "Courses");

//Home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

//Create
app.post("/storeCourse", (req, res) => {
    res.type('text/html');
    res.write(storeCourseHtml);
    //retrieve data from body part
    let req = JSON.parse(req.body);
    let courseId = req._id;
    let name = req.courseName;
    let desc = req.courseDescription;
    let amt = req.amount;
    //connnect to database
    db.on("error", (err) => console.log(err));
    db.once("open", () => {
        let c1 = {
            _id: courseId,
            courseName: name,
            courseDescription: desc,
            amount: amt
        };
        //store in database
        Course.save((c1), (estorageErrrr, result) => {
            if(!storageErr) {
                console.log("Course added successfully!");
            }
            else {
                console.log("An error has occurred!\n" + storageErr);
            }
        });
    });
    mongoose.disconnect();
    res.send(__dirname + "index.html");
});

//Delete
app.post("/deleteCourse/:cid", (req, res) => {
    res.type("text/html");
    res.write(deleteCourseHtml);
    //read param
    let cid = req.params.cid;
    //connnect to database
    db.on("error", (err) => console.log(err));
    db.once("open", () => {
        //delete in database
        Course.deleteOne({_id:cid}, (deleteErr, result) => {
            if(!deleteErr) {
                if(result.deletedCount > 0) {
                    console.log("Record deleted");
                }
                else {
                    console.log("Record not present");
                }
            }
            else {
                console.log("An error has occurred while deleting the record.\n" + deleteErr);
            }
        });
    });
    mongoose.disconnect();
    res.sendFile(__dirname + "/index.html")
});

//Update
app.post("/updateCourse/:cid", (req, res) => {
    res.type("text/html");
    res.write(updateCourseHtml);
    //read param
    req = JSON.parse(req.body);
    let cid = req.params.cid;
    let amt = req.body.amount;
    //connnect to database
    db.on("error", (err) => console.log(err));
    db.once("open", () => {
        //update in database
        Course.updateOne({_id:cid}, {$set:{amount:amt}}, (updateErr, result) => {
            if(!updateErr) {
                if(result.nModified > 0) {
                    console.log("Record updated successfully!");
                }
                else {
                    console.log("Record was not updated");
                }
            }
            else {
                console.log("An error has occurred while updating the record!\n" + updateErr);
            }
        })
    });
    mongoose.disconnect();
    res.sendFile(__dirname + "/index.html");
});

//Read
app.get("/displayCourses", (req, res) => {
    // connect to database
    db.on("error", (err) => console.log(err));
    db.once("open", () => {
        // retrieve records from database and store in array
        Course.find({}, (displayErr, result) => {
            if(!displayErr) {
                // use loop to store everything in table with ``
                result.forEach(doc => courseTableHtml += 
                    `<td>${doc._id}</td>
                    <td>${doc.courseName}</td>
                    <td>${doc.courseDescription}</td>
                    <td>${doc.amount}</td>
                    </tr>`);
                courseTableHtml += `</table>
                </div>`;
                res.write(courseTableHtml);
            }
            else {
                console.log("An error has occurred while trying to display the course table!\n" + displayErr);
            }
            mongoose.disconnect();
        });
    });
});

app.listen(port, () => console.log(`Running on Port Number: ${port}`));
