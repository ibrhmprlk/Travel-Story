//express= Node.js için web sunucusu framework’ü.
//cors = Tarayıcıdan farklı bir domain/porttan gelen isteklerin engellenmemesi için.
//bcrypt = şifre saklamak ve doğrulamak için.
//req.body = gelen HTTP isteğinin gövdesinde veriyi tutmak
//return =  bir fonksiyonun çalışmasını bitirir ve bir değer döndürür.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const User = require("./models/user.model");
const TravelStory = require("./models/travelStory.model");
const { authenticateToken } = require("./utilities");
const travelStoryModel = require("./models/travelStory.model");

const app = express();

mongoose
  .connect(config.connectionString)
  .then(() => console.log("MongoDB connection successful"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Bağlantı olmazsa uygulamayı kapat
  });

// CORS ayarını en başta doğru şekilde yapıyoruz:
app.use(
  cors({
    origin: "*", // Tüm domainlerden gelen isteklere izin ver
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Created uploads directory');
}


app.use("/uploads", express.static("uploads"));

//Create Account
app.post("/create-account", async (req, res) => {
  console.log("Get user request received", req.body);
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const isUser = await User.findOne({ email });
    if (isUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 2);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await user.save();

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    return res.status(201).json({
      error: false,
      user: { fullName: user.fullName, email: user.email },
      accessToken,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//Login
app.post("/login", async (req, res) => {
  console.log("Login request body:", req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "72h" }
    );

    return res.status(200).json({
      error: false,
      user: { fullName: user.fullName, email: user.email },
      accessToken,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login hatası:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { userId } = req.user; // Doğrudan userId alabiliriz
  const isUser = await User.findById(userId);

  if (!isUser) {
    return res.sendStatus(401);
  }

  res.json({
    user: isUser,
    message: "",
  });
});

//Route to handle image upload
app.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    console.log("req.file:", req.file);
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: "No image uploaded",
      });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    return res.status(200).json({
      error: false,
      imageUrl,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

//Add Travel Story
app.post("/add-travel-story", authenticateToken, async (req, res) => {
  console.log("Add travel story request body:", req.body);
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  if (
    !title ||
    !story ||
    !visitedLocation ||
    !Array.isArray(visitedLocation) ||
    visitedLocation.length === 0 ||
    !visitedDate
  ) {
    return res
      .status(400)
      .json({ error: true, message: "Title, story, location and date are required." });
  }

  const parsedVisitedDate = new Date(visitedDate);
  if (isNaN(parsedVisitedDate.getTime())) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid visited date" });
  }

  try {
    const placeholderImgUrl = `https://${req.get('host')}/assets/placeholder.png`;
    const finalImageUrl = imageUrl || placeholderImgUrl;

    const newStory = new TravelStory({
      title,
      story,
      visitedLocation,
      imageUrl: finalImageUrl,
      visitedDate: parsedVisitedDate,
      userId,
    });

    await newStory.save();

    return res.status(201).json({
      error: false,
      message: "Travel story added successfully",
      travelStory: newStory,
    });
  } catch (err) {
    console.error("Error adding travel story:", err);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

//Delete an handle image upload
app.delete("/delete-image", async (req, res) => {
  try {
    const { imageUrl } = req.query;

    if (!imageUrl) {
      return res.status(400).json({
        error: true,
        message: "The 'imageUrl' query parameter is required",
      });
    }

    // URL'den dosya adını çıkar
    const filename = path.basename(imageUrl);

    // Dosya yolu (uploads klasörü içinde)
    const filePath = path.join(__dirname, "uploads", filename);

    // Dosyanın var olup olmadığını kontrol et
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: true,
        message: "File not found",
      });
    }

    // Dosyayı sil
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Dosya silme hatası:", err);
        return res.status(500).json({
          error: true,
          message: "Failed to delete the image",
        });
      }

      return res.status(200).json({
        error: false,
        message: "Image deleted successfully",
      });
    });
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//Get All Travel Story
app.get("/get-all-stories", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    const travelStories = await TravelStory.find({ userId }).sort({
      isFavourite: -1,
    });

    return res.status(200).json({
      error: false,
      stories: travelStories,
    });
  } catch (error) {
    console.error("Get all stories error:", error);

    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
});

//Server static files from the uploads and assets directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "public")));

//Edit Travel Story
app.put("/edit-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  if (!title || !story || !visitedLocation || !Array.isArray(visitedLocation) || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
}

  let parsedVisitedDate = new Date(visitedDate);

  if (isNaN(parsedVisitedDate.getTime())) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid visited date" });
  }

  try {
    const travelStory = await TravelStory.findOne({
      _id: id,
      userId: userId,
    });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });
    }
    
    // Placeholder URL'yi dinamik olarak oluştur
    const protocol = req.protocol;
    const host = req.get('host');
    const placeholderImgUrl = `${protocol}://${host}/assets/placeholder.png`;

    travelStory.title = title;
    travelStory.story = story;
    travelStory.visitedLocation = visitedLocation;
    travelStory.imageUrl = imageUrl || placeholderImgUrl;
    travelStory.visitedDate = parsedVisitedDate;

    await travelStory.save();

    return res.status(200).json({
      error: false,
      message: "Update successful",
      story: travelStory,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: true, message: "Server error while updating story" });
  }
});

//Delete a travel story
app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    // İlgili hikayeyi kullanıcıya göre bul
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });
    }

    // Hikayeyi veritabanından sil
    await travelStory.deleteOne();

    // --- GÜVENLİK İÇİN EK KONTROL BAŞLANGICI ---
    const imageUrl = travelStory.imageUrl;
    const protocol = req.protocol;
    const host = req.get('host');
    const placeholderImgUrl = `${protocol}://${host}/assets/placeholder.png`;

    // Resmin bir placeholder olup olmadığını kontrol et
    if (imageUrl && imageUrl !== placeholderImgUrl) {
      const filename = path.basename(imageUrl);
      const filePath = path.join(__dirname, "uploads", filename);

      // Dosyanın varlığını kontrol etmeden silmeye çalışma
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Failed to delete image file:", err);
          } else {
            console.log("Image file deleted successfully:", filePath);
          }
        });
      }
    }
    // --- GÜVENLİK İÇİN EK KONTROL SONU ---

    return res
      .status(200)
      .json({ message: "Travel story deleted successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: true, message: "Server error while deleting story" });
  }
});

//Update isFavourite
app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
  let { id } = req.params;
  id = id.trim(); // Fazla boşluk ve yeni satır karakterlerini kaldırıyoruz
  const { isFavourite } = req.body;
  const { userId } = req.user;

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });
    }

    travelStory.isFavourite = isFavourite;
    await travelStory.save();

    res.status(200).json({ story: travelStory, message: "Update successful" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

//Search travel stories
app.get("/search", authenticateToken, async (req, res) => {
  const query = req.query.query; // ya da req.body.query, frontend nasıl gönderiyorsa ona göre değiştir
  const { userId } = req.user;

  if (!query) {
    return res.status(400).json({ error: true, message: "Query is required" });
  }

  try {
    const searchResult = await TravelStory.find({
      userId: userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { story: { $regex: query, $options: "i" } },
        { visitedLocation: { $regex: query, $options: "i" } },
      ],
    }).sort({ isFavourite: -1 });

    return res.status(200).json({ stories: searchResult });
  } catch (error) {
    console.error("Search error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

//Filter travel stories by date range
app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const { userId } = req.user;

  try {
    // Query parametrelerini kontrol et
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: true, message: "startDate and endDate are required" });
    }

    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid date format" });
    }

    const filteredStories = await TravelStory.find({
      userId: userId,
      visitedDate: { $gte: start, $lte: end },
    }).sort({ isFavourite: -1 });

    res.status(200).json({ stories: filteredStories });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: true, message: "Server error while filtering stories" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
