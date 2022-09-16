import { connect } from 'mongoose';

export default connect(
  process.env.DB_URI,
  () => {
    console.log("Connected to DB");
  }, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
);