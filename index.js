const express = require('express');
const app = express();

app.use(express.json());

let rooms = [
  {
    roomID: "0",
    bedsAvailable: 3,
    roomAmenities: "Wifi,AC,TV,Fridge",
    pricePerhr: "100"
  },
  {
    roomID: "1",
    bedsAvailable: 2,
    roomAmenities: "Wifi,AC,TV",
    pricePerhr: "70"
  },
  {
    roomID: "2",
    bedsAvailable: 5,
    roomAmenities: "Wifi,AC,TV,Fridge",
    pricePerhr: "150"
  },
  {
    roomID: "3",
    bedsAvailable: 8,
    roomAmenities: "Wifi,AC,TV,Fridge",
    pricePerhr: "180"
  }
];

let bookings = [
  {
    customerName: "Subu",
    bookingDate: "15-10-2023",
    startTime: "8:00AM",
    endTime: "6:00PM",
    bookingID: "BK25",
    roomID: "0",
    status: "booked",
    bookedON: "10-10-2023"
  },
  {
    customerName: "Harish",
    bookingDate: "18-10-2023",
    startTime: "10:00AM",
    endTime: "11:00PM",
    bookingID: "BK26",
    roomID: "1",
    status: "booked",
    bookedON: "15-10-2023"
  },
  {
    customerName: "Bala",
    bookingDate: "28-10-2023",
    startTime: "01:00PM",
    endTime: "11:00PM",
    bookingID: "BK27",
    roomID: "2",
    status: "booked",
    bookedON: "19-10-2023"
  },
  {
    customerName: "Madhu",
    bookingDate: "23-10-2023",
    startTime: "6:00AM",
    endTime: "7:00PM",
    bookingID: "BK28",
    roomID: "3",
    status: "booked",
    bookedON: "09-10-2023"
  }
];

let customers = [
  {
    name: "Subu",
    bookings: [
      {
        customerName: "Subu",
        bookingDate: "15-10-2023",
        startTime: "8:00AM",
        endTime: "6:00PM",
        bookingID: "BK25",
        roomID: "0",
        status: "booked",
        bookedON: "10-10-2023"
      }
    ]
  },
  {
    name: "Harish",
    bookings: [
      {
        customerName: "Harish",
        bookingDate: "18-10-2023",
        startTime: "10:00AM",
        endTime: "11:00PM",
        bookingID: "BK26",
        roomID: "1",
        status: "booked",
        bookedON: "15-10-2023"
      }
    ]
  },
  {
    name: "Bala",
    bookings: [
      {
        customerName: "Bala",
        bookingDate: "28-10-2023",
        startTime: "01:00PM",
        endTime: "11:00PM",
        bookingID: "BK27",
        roomID: "2",
        status: "booked",
        bookedON: "19-10-2023"
      }
    ]
  },
  {
    name: "Madhu",
    bookings: [
      {
        customerName: "Madhu",
        bookingDate: "23-10-2023",
        startTime: "6:00AM",
        endTime: "7:00PM",
        bookingID: "BK28",
        roomID: "3",
        status: "booked",
        bookedON: "09-10-2023"
      }
    ]
  }
];

// Get all rooms
app.get('/rooms', (request, response) => {
  response.status(200).send({
    message: "List of rooms",
    rooms
  });
});

// Create a new room
app.post('/rooms', (request, response) => {
  let data = request.body;
console.log('Received data:', data); 
  let filteredData = rooms.filter((e) => e.roomID == data.roomID);
  if (filteredData.length === 0) {
    rooms.push(data);
    response.status(201).send({
      message: "Room created successfully"
    });
  } else {
    response.status(400).send({
      message: "Room already exists"
    });
  }
});

// Book a room
app.post('/booking/:id', (request, response) => {
  try {
    const id = request.params.id;
    let bookRoom = request.body;
    let date = new Date();
    let dateFormat = date.toLocaleDateString();
    let room = rooms.find((e) => e.roomID == id);

    const customerName = bookRoom.customerName;
    if (!room) {
      response.status(404).send({
        message: "Room does not exist"
      });
      return;
    }

    let conflictingBooking = bookings.find((b) => b.roomID === id && b.bookingDate === bookRoom.bookingDate);
    if (conflictingBooking) {
      response.status(409).send({
        message: "Room already booked on this date"
      });
      return;
    }

    let newID = "BK" + (bookings.length + 1);
    let newBooking = { ...bookRoom, bookingID: newID, roomID: id, status: "booked", bookedON: dateFormat };
    bookings.push(newBooking);

    let customerDetails = customers.find((cust) => cust.name === customerName);
    if (customerDetails) {
      customerDetails.bookings.push(newBooking);
    } else {
      customers.push({ name: newBooking.customer, bookings: [newBooking] });
    }

    response.status(201).send({
      message: "Room booked successfully",
      booking: newBooking
    });
  } catch (error) {
    response.status(500).send({
      message: "Error in booking room",
      error: error.message
    });
  }
});

// Get all bookings
app.get('/viewbookings', (request, response) => {
  const bookedRooms = bookings.map(booking => {
    const { roomID, status, customerName, bookingDate, startTime, endTime } = booking;
    return { roomID, status, customerName, bookingDate, startTime, endTime };
  });
  response.status(200).send({
    message: "List of booked rooms",
    bookedRooms
  });
});

// Get customer bookings by name
app.get('/customers/:name', (request, response) => {
  const { name } = request.params;
  const customer = customers.find(cust => cust.name === name);

  if (!customer) {
    response.status(404).send({ message: "Customer not found" });
    return;
  }

  const customerBookings = customer.bookings.map(booking => {
    const { customerName, roomID, startTime, endTime, bookingID, status, bookingDate, bookedON } = booking;
    return { customer: customerName, roomID, startTime, endTime, bookingID, status, bookingDate, bookedON };
  });

  const count = customerBookings.length;
  response.send({
    message: `${name} booked ${count} time(s)`,
    customer: customerBookings
  });
});

// Start the server
app.listen(3000, () => console.log("Server listening on port 3000"));