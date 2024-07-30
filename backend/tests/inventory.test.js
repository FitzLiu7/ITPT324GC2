jest.setTimeout(10000); // Set timeout to 10 seconds (10000 ms)\
const { getData } = require('../models/dataModel');

test('getData should return data for inventory forecast', async () => {
    const data = await getData('inventoryForecast');
    expect(data).toBeDefined();
});