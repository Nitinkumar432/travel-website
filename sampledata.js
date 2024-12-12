const mongoose = require("mongoose");
const Flight = require("./models/FlightSchema");

// Connect to MongoDB
mongoose.connect("mongodb+srv://nitinkaliramna9:nitin123@cluster0.dprqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const indianCities = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Patna", "Hajipur",
];

const sampleFlights = [
  {
    flightName: "AI 101",
    companyName: "Air India",
    source: "Delhi",
    destination: "Mumbai",
    availabilityDates: ["2024-12-01", "2024-12-02", "2024-12-03"],
    ticketOptions: [
      { classType: "Economy", price: 4500, facilities: ["Meals", "WiFi"] },
      { classType: "Business", price: 12000, facilities: ["Meals", "WiFi", "Extra Legroom", "Priority Boarding"] },
    ],
    duration: "2h 30m",
    baggageAllowance: "20kg",
  },
];

// Generate more sample flights
const generateSampleFlights = (numFlights) => {
  const flightData = [];
  let flightNumber = 102;

  for (let i = 0; i < numFlights; i++) {
    const source = indianCities[Math.floor(Math.random() * indianCities.length)];
    let destination;
    do {
      destination = indianCities[Math.floor(Math.random() * indianCities.length)];
    } while (source === destination);

    const availabilityDates = Array.from({ length: 5 }, (_, idx) => {
      const date = new Date(2024, 11, 1 + idx); // Generate dates in December
      return date.toISOString().split("T")[0];
    });

    flightData.push({
      flightName: `AI ${flightNumber++}`,
      companyName: ["Air India", "IndiGo", "SpiceJet", "Vistara"][Math.floor(Math.random() * 4)],
      source,
      destination,
      availabilityDates,
      ticketOptions: [
        {
          classType: "Economy",
          price: Math.floor(Math.random() * 3000) + 2500, // Random price between 2500-5500
          facilities: ["Meals", "WiFi"].slice(0, Math.floor(Math.random() * 2) + 1),
        },
        {
          classType: "Business",
          price: Math.floor(Math.random() * 5000) + 10000, // Random price between 10000-15000
          facilities: ["Meals", "WiFi", "Extra Legroom", "Priority Boarding"].slice(
            0,
            Math.floor(Math.random() * 4) + 1
          ),
        },
      ],
      duration: `${Math.floor(Math.random() * 3) + 1}h ${Math.floor(Math.random() * 60)}m`, // Random duration
      baggageAllowance: `${Math.floor(Math.random() * 10) + 15}kg`, // Random allowance between 15kg-25kg
    });
  }

  return flightData;
};

sampleFlights.push(...generateSampleFlights(19)); // Adding 19 more to total 20 flights

const insertSampleData = async () => {
  try {
    await Flight.insertMany(sampleFlights);
    console.log("Sample data inserted successfully.");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

insertSampleData();
