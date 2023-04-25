export default {
  afterUpdate(event) {
    const {result} = event

    if (result.is_paid) {
      console.log('Order has been paid!')
    }
  },
};
