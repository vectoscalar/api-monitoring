# API Monitoring Plugin

This README provides instructions for installing and using the API monitoring plugin, as well as visualizing the collected data.

## Table of Contents

1. [Installation](#installation)
   - [Library Repository](#library-repository)
   - [Linking the Plugin](#linking-the-plugin)
2. [Usage](#usage)
3. [Data Visualization](#data-visualization)
   - [Appsmith](#appsmith)
   - [MongoDB Charts](#mongodb-charts)

## Installation

### Library Repository

1. Navigate to the library repository.
2. Install dependencies:

### Linking the Plugin

In the root folder of library/plugin create a symbolic link: using command npm link

## Usage

1. import the plugin in your application use below

```
        import apiMonitorPlugin from "api-monitor-plugin";
```

2. Register plugin in fastify with different configuration options

```
        app.register(apiMonitorPlugin, {
          mongoUrl:
            "mongodb+srv://ss:sardana786@cluster0.hjv8pvk.mongodb.net/test",
          organizationName: "o1",
          projectName: "p1",
          microserviceName: "m1",
          logLevel: "info",
        });
```

3. Run your Server

## Data Visualization

### Appsmith

1. **Connect to MongoDB:**

   - Create a new Appsmith application
   - Add a new MongoDB datasource
   - Enter your MongoDB connection details

2. **Create a new page and add a widget:**

   - Add a new page to your application
   - Drag and drop a chart widget onto the page

3. **Write a MongoDB query:**
   - Create a new mongo db query
   - Example query (adjust as needed):

```javascript
[
  {
    $group: {
      _id: "$statusCode",
      invocationCount: {
        $sum: 1,
      },
    },
  },
];
```

4. **Bind data to the chart widget:**
5. **Customize and deploy your application**

### MongoDB Charts

1. **Access MongoDB Charts:**

   - Log in to MongoDB Atlas
   - Navigate to the Charts section

2. **Create a new dashboard and chart:**

   - Click "New Dashboard"
   - Add a new chart to the dashboard

3. **Configure the chart:**

   - Select your database and collection
   - Choose an appropriate chart type (e.g., Line Chart for response times)
   - Select fields to display (e.g., timestamp, response time)
   - Apply any necessary aggregations or filters

4. **Customize the chart appearance and save**

5. **View your completed dashboard**

For more detailed instructions on data visualization, refer to the Appsmith and MongoDB Charts documentation.
