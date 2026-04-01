const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const billingFile = path.join(__dirname, 'data', 'billing.json');
const returnsFile = path.join(__dirname, 'data', 'returns.json');

function readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/* BILLING ENDPOINT */
app.post('/api/billing', (req, res) => {
    const billingData = req.body;

    if (!billingData.fullName || !billingData.address || !billingData.cardNumber) {
        return res.status(400).json({ message: 'Missing required billing fields' });
    }

    const existing = readJsonFile(billingFile);
    existing.push({
        id: Date.now(),
        ...billingData
    });
    writeJsonFile(billingFile, existing);

    res.status(201).json({ message: 'Billing details saved successfully', data: billingData });
});

app.get('/api/billing', (req, res) => {
    const billingRecords = readJsonFile(billingFile);
    res.json(billingRecords);
});

/* RETURNS ENDPOINT */
app.post('/api/returns', (req, res) => {
    const returnData = req.body;

    if (!returnData.productName || !returnData.reason || !returnData.condition) {
        return res.status(400).json({ message: 'Missing required return fields' });
    }

    const existing = readJsonFile(returnsFile);
    existing.push({
        id: Date.now(),
        status: 'Pending',
        ...returnData
    });
    writeJsonFile(returnsFile, existing);

    res.status(201).json({ message: 'Return request submitted successfully', data: returnData });
});

app.get('/api/returns', (req, res) => {
    const returns = readJsonFile(returnsFile);
    res.json(returns);
});

app.put('/api/returns/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const returns = readJsonFile(returnsFile);
    const index = returns.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Return request not found' });
    }

    returns[index].status = status;
    writeJsonFile(returnsFile, returns);

    res.json({ message: 'Return status updated', data: returns[index] });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});