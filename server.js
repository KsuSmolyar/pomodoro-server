import express from 'express';
import webpush from 'web-push';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: 'https://ksusmolyar.github.io',
}));
app.use(express.json());

const publicVapidKey = 'BM8n9S3709gqIbfpd_Rwh00LhuwJMIDqdgJAQXeXjdkuyfvIKYcUbO5U8gkILE3w3reZZY1u_K9ksq_UUDVM6Qc';
const privateVapidKey = 'kiz-Va0JtwQtfDenuecDlyicFAS5hjNdNAGuWZFjdDc';

webpush.setVapidDetails(
  'mailto:ksu_smolyar@mail.ru',
  publicVapidKey,
  privateVapidKey
);

// временное хранилище подписок (для теста, в продакшне лучше база)
const subscriptions = [];

app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  // проверим, есть ли уже эта подписка
  const exists = subscriptions.find(s => s.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
  }

  res.status(201).json({});
});

app.post('/notify', async (req, res) => {
    const { endpoint } = req.body; 
    const sub = subscriptions.find(s => s.endpoint === endpoint);
    if (!sub) {
        return res.status(404).json({ error: 'Subscription not found' });
    }

   const payload = JSON.stringify({
     title: 'Pomodoro Timer',
     body: 'Время вышло!'
   });

    try {
        await webpush.sendNotification(sub, payload);
        res.status(200).json({ message: 'Notification sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
