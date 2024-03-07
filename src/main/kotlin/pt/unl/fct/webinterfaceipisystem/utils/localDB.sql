CREATE TABLE Inclinometer (
    Id INT PRIMARY KEY,
    Name VARCHAR(255),
    Length FLOAT,
    CurrentFrequency VARCHAR(50),
    Azimuth FLOAT,
    Latitude FLOAT,
    Longitude FLOAT,
    HeightTopSensor FLOAT,
    CasingAngleToHorizontal FLOAT
);

CREATE TABLE MonitoringGroup (
    Id INT PRIMARY KEY,
    Name VARCHAR(255),
    Description TEXT
);

CREATE TABLE MonitoringGroupInclinometer (
    MonitoringGroupId INT,
    InclinometerId INT,
    PRIMARY KEY (MonitoringGroupId, InclinometerId)
);

CREATE TABLE Sensor (
    Id INT PRIMARY KEY,
    HasFixedPoint BOOLEAN,
    InclinometerId INT,
    FOREIGN KEY (InclinometerId) REFERENCES Inclinometer(Id)
);

CREATE TABLE SensorAuxTable (
    Id INT PRIMARY KEY,
    IdA INT,
    IdB INT,
    SensorDist FLOAT,
    FOREIGN KEY (IdA) REFERENCES Sensor(Id),
    FOREIGN KEY (IdB) REFERENCES Sensor(Id)
);

CREATE TABLE InclinometerFrequencyHistory (
    LogDate DATE PRIMARY KEY,
    Frequency FLOAT,
    InclinometerId INT,
    FOREIGN KEY (InclinometerId) REFERENCES Inclinometer(Id)
);

CREATE TABLE SoilAndWaterLayers (
    Id INT PRIMARY KEY,
    Layer INT,
    WaterLevel FLOAT,
    SurfaceLevel FLOAT,
    InclinometerId INT,
    FOREIGN KEY (InclinometerId) REFERENCES Inclinometer(Id)
);

CREATE TABLE Layer (
    Id INT PRIMARY KEY,
    Symbol VARCHAR(5),
    Description TEXT,
    Color VARCHAR(10),
    LayerThickness FLOAT
    SoilAndWaterLayerId INT,
    FOREIGN KEY (SoilAndWaterLayerId) REFERENCES SoilAndWaterLayer(Id)
);

CREATE TABLE MonitoringProfile (
    Id INT PRIMARY KEY,
    Name VARCHAR(255),
    Code VARCHAR(10),
    Description TEXT,
    Type VARCHAR(50)
    MonitoringGroupId INT,
    FOREIGN KEY (MonitoringGroupId) REFERENCES MonitoringGroup(Id)
);

CREATE TABLE ProfilePositionAdjustment (
    Id INT PRIMARY KEY,
    Type VARCHAR(15),
    ImageURLPath VARCHAR(255)
    MonitoringProfileId INT,
    FOREIGN KEY (MonitoringProfileId) REFERENCES MonitoringProfile(Id)
);

CREATE TABLE ProfilePosAdjWithMonitGroupIncli (
    ProfilePosAdjId INT,
    MonitGroupIncliId INT,
    PRIMARY KEY (ProfilePosAdjId, MonitGroupIncliId)
);

CREATE TABLE ProfilePosAdjWithMonitProfile (
    ProfilePosAdjId INT,
    MonitProfileId INT,
    PRIMARY KEY (ProfilePosAdjId, MonitProfileId)
);

CREATE TABLE Point (
    Id INT PRIMARY KEY,
    PositionX FLOAT,
    PositionY FLOAT
    ProfilePositionAdjustmentId INT,
    FOREIGN KEY (ProfilePositionAdjustmentId) REFERENCES ProfilePositionAdjustment(Id)
);

CREATE TABLE ProfilePosAdjWithPoint (
    ProfilePosAdjId INT,
    PointId INT,
    PRIMARY KEY (ProfilePosAdjId, PointId)
);

CREATE TABLE User (
    Id INT PRIMARY KEY,
    Name VARCHAR(255),
    Email VARCHAR(255),
    Password VARCHAR(255),
    PhoneNumber VARCHAR(15),
    Company INT,
    Role VARCHAR(15),
    FOREIGN KEY (Company) REFERENCES Company(Id)
);

CREATE TABLE Company (
    Id INT PRIMARY KEY,
    Name VARCHAR(255)
);

CREATE TABLE Region (
    Name VARCHAR(255) PRIMARY KEY
);

CREATE TABLE InfluxDB (
    URL VARCHAR(255),
    Port INT,
    Token VARCHAR(255),
    Organization VARCHAR(255),
    Bucket VARCHAR(255),
    PRIMARY KEY (URL, Port)
);

CREATE TABLE MQTT (
    ClientId VARCHAR(255),
    Server VARCHAR(255),
    Port INT,
    Username VARCHAR(255),
    Password VARCHAR(255),
    PRIMARY KEY (ClientId, Server)
);

CREATE TABLE Topic (
    Topic VARCHAR(255) PRIMARY KEY
);
