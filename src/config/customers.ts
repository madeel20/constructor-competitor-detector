import { CustomersConfig } from './types';
import { envConfig } from './env';

// Customers configuration
export const customersConfig: CustomersConfig = {
  customers: [
    // {
    //   name: "Everlane",
    //   pages: [
    //     {
    //       name: "Homepage",
    //       url: "https://www.everlane.com/"
    //     }
    //   ]
    // },
    {
      name: "King Arthur Baking",
      pages: [
        {
          name: "Homepage",
          url: "https://shop.kingarthurbaking.com/"
        }
      ]
    },
    // {
    //     name: "Monica Vinader",
    //     pages: [
    //         {
    //             name: "Homepage",
    //             url: "https://www.monicavinader.com"
    //         }
    //     ]
    // }
  ],
  timeout: envConfig.timeout,
  headless: envConfig.headless,
  userAgent: envConfig.userAgent
};
