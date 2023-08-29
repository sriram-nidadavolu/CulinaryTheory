
module.exports = {
  server: {
    port: 9000
  },

  database: {
    url: `mongodb://${process.env.db_user}:${process.env.db_pwd}@${process.env.db_host}/${process.env.db_name}`
  },

  regex: {
    email: /^[^\W_]+\w*(?:[.-]\w*)*\+?[^\W_]+@[^\W_]+(?:[.-]?\w*[^\W_]+)*(?:\.[^\W_]{2,})$/,
    // old: /^[^\W_]+\w*(?:[.-]\w*)*[^\W_]+@[^\W_]+(?:[.-]?\w*[^\W_]+)*(?:\.[^\W_]{2,})$/ (doesn't take +)
    password_pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  },

  email :{
    host: "smtp.gmail.com",
    port: 587,
    tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2"
    },
    auth: {
        user: process.env.email_user,
        pass: process.env.email_pass
    }
  },
  paypal: {
    trial_id: "P-0H974515YU526521MMOD4PPI",
    non_trial_id: "P-21N34790H2065803JMOESPXQ",
    base_url: "https://api-m.sandbox.paypal.com",
    subscription_body: {
      plan_id:"",
      start_time: "",
      subscriber: {
      name: {
          given_name: ""  
      },
      email: ""
      },
      application_context: {
      brand_name: "The Culinary Theory",
      locale: "en-US",
      shipping_preference: "NO_SHIPPING",
      user_action: "SUBSCRIBE_NOW",
      payment_method: {
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
      },
  }
  }
  }
};
