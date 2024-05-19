
// const csv = require('csv-parser');
// const fs = require('fs');
// const multer = require('multer');
// const User = require('../db/Users');
// const List = require('../db/Lists');
// const UserCustomProperty = require('../db/UserCustomProperty');
// const CustomPropertyList = require('../db/CustomPropertyList');

// const upload = multer({ dest: 'uploads/' });

// const uploadCSV = async (req, res) => {
//   try {
//     upload.single('file')(req, res, async (err) => {
//       if (err) {
//         return res.status(400).json({ message: 'Error uploading file: ' + err.message });
//       }

//       if (!req.file) {
//         return res.status(400).json({ message: 'Please upload a CSV file' });
//       }

//       const filePath = req.file.path;
//       const listId = req.params?.list_id || req.query?.list_id;

//       if (!listId) {
//         return res.status(400).json({ message: 'Missing list_id in the URL' });
//       }

//       const list = await List.findById(listId);

//       if (!list) {
//         return res.status(400).json({ message: 'Invalid list_id' });
//       }

//       let successfulUsers = 0;
//       let failedUsers = 0;
//       const userErrors = [];
//       const promises = [];
//       const users=[];
//       const userCustomProperties=[];

//       const csvStream = fs.createReadStream(filePath).pipe(csv());

//       csvStream.on('data', (row) => {
//         promises.push((async () => {
//           try {
//             const { name, email, ...customProperties } = row;

//             if (!name || !email) {
//               throw new Error('Missing required fields: name or email');
//             }

//             const existingUser = await User.findOne({ email });
//             if (existingUser) {
//               throw new Error(`Duplicate email: ${email}`);
//             }

//             const user = new User({ name, email, list: list._id });
//             users.push(user);
//             successfulUsers++;

//             for (const [title, value] of Object.entries(customProperties)) {
//               const customPropertyList = await CustomPropertyList.findOne({ title, list_id: listId });
//               if (customPropertyList) {
//                 const userCustomProperty = new UserCustomProperty({
//                   user_id: user._id,
//                   custom_property_list_id: customPropertyList._id,
//                   value: value || customPropertyList.defaultValue,
//                 });
//                 userCustomProperties.push(userCustomProperty);

//                 // Find the user in the users array and add the custom property ID
//                 const userIndex = users.findIndex(u => u._id.equals(user._id));
//                 if (userIndex > -1) {
//                   if (!users[userIndex].customProperties) {
//                     users[userIndex].customProperties = [];
//                   }
//                   users[userIndex].customProperties.push(userCustomProperty._id);
//                 }
//               } else {
//                 console.warn(`Custom property '${title}' not found in database, skipping...`);
//               }
//             }
//           } catch (error) {
//             failedUsers++;
//             userErrors.push({ row: row, error: error.message });
//           }
//         })());
//       });

//       csvStream.on('end', async () => {
//         try {
//           await Promise.all(promises);

//           if (failedUsers > 0) {
//             // Handle errors and return user info
//             const totalUsers = await User.countDocuments({ list: list._id });
//             const response = {
//               message: `${successfulUsers} users added successfully, ${failedUsers} users failed to add`,
//               successfulUsers,
//               failedUsers,
//               totalUsers,
//               userErrors, // Array of objects with { row: {}, error: string }
//             };
//             return res.status(400).json(response);
//           } else {
//             await User.create(users);
//             await UserCustomProperty.create(userCustomProperties);

//             const response ={
//                 message: 'CSV data uploaded successfully!',
//                 users: users
//             };
//             res.status(201).json(response);
//           }

//           fs.unlink(filePath, (err) => {
//                         if (err) {
//                           console.error('Error deleting uploaded file:', err);
//                         }
//                       });
//                     } catch (error) {
//                       console.error('Error processing CSV data:', error);
//                       res.status(500).json({ message: 'Error processing CSV data: ' + error.message });
//                     }
//                   });
            
//                   csvStream.on('error', (err) => {
//                     console.error('Error parsing CSV:', err);
//                     res.status(500).json({ message: 'Error processing CSV file' });
//                   });
            
//                 });
//               } catch (error) {
//                 console.error('Error uploading CSV:', error);
//                 res.status(500).json({ message: 'Internal server error' });
//               }
//             };

// module.exports = uploadCSV;
const asyncHandler = require('express-async-handler');
const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');
const User = require('../db/Users');
const List = require('../db/Lists');
const UserCustomProperty = require('../db/UserCustomProperty');
const CustomPropertyList = require('../db/CustomPropertyList');
const { Parser } = require('json2csv');

const upload = multer({ dest: 'uploads/' });

const uploadCSV =  asyncHandler(async (req, res) => {
  try {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: 'Error uploading file: ' + err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a CSV file' });
      }

      const filePath = req.file.path;
      const listId = req.params?.list_id || req.query?.list_id;

      if (!listId) {
        return res.status(400).json({ message: 'Missing list_id in the URL' });
      }

      const list = await List.findById(listId);

      if (!list) {
        return res.status(400).json({ message: 'Invalid list_id' });
      }

      let successfulUsers = 0;
      let failedUsers = 0;
      const userErrors = [];
      const users = [];
      const userCustomProperties = [];
      const promises = [];

      const csvStream = fs.createReadStream(filePath).pipe(csv());

      csvStream.on('data', (row) => {
        promises.push((async () => {
          try {
            const { name, email, ...customProperties } = row;

            if (!name || !email) {
              throw new Error('Missing required fields: name or email');
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
              throw new Error(`Duplicate email: ${email}`);
            }

            const user = new User({ name, email, list: list._id });
            users.push(user);
            successfulUsers++;

            for (const [title, value] of Object.entries(customProperties)) {
              const customPropertyList = await CustomPropertyList.findOne({ title, list_id: listId });
              if (customPropertyList) {
                const userCustomProperty = new UserCustomProperty({
                  user_id: user._id,
                  custom_property_list_id: customPropertyList._id,
                  value: value || customPropertyList.defaultValue,
                });
                userCustomProperties.push(userCustomProperty);

                const userIndex = users.findIndex(u => u._id.equals(user._id));
                if (userIndex > -1) {
                  if (!users[userIndex].customProperties) {
                    users[userIndex].customProperties = [];
                  }
                  users[userIndex].customProperties.push(userCustomProperty._id);
                }
              } else {
                console.warn(`Custom property '${title}' not found in database, skipping...`);
              }
            }
          } catch (error) {
            failedUsers++;
            userErrors.push({ ...row, error: error.message });
          }
        })());
      });

      csvStream.on('end', async () => {
        try {
          await Promise.all(promises);

          const totalUsers = await User.countDocuments({ list: list._id });

          if (failedUsers > 0) {
            const json2csvParser = new Parser({ fields: Object.keys(userErrors[0]) });
            const errorCsv = json2csvParser.parse(userErrors);

            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error deleting uploaded file:', err);
              }
            });

            res.status(400).json({
              message: `${successfulUsers} users added successfully, ${failedUsers} users failed to add`,
              successfulUsers,
              failedUsers,
              totalUsers,
              userErrorsCsv: errorCsv, // Including the CSV data as a string in the response
            });
          } else {
            await User.create(users);
            await UserCustomProperty.create(userCustomProperties);

            res.status(201).json({
              message: 'CSV data uploaded successfully!',
              successfulUsers,
              failedUsers,
              totalUsers,
            });

            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error deleting uploaded file:', err);
              }
            });
          }
        } catch (error) {
          console.error('Error processing CSV data:', error);
          res.status(500).json({ message: 'Error processing CSV data: ' + error.message });
        }
      });

      csvStream.on('error', (err) => {
        console.error('Error parsing CSV:', err);
        res.status(500).json({ message: 'Error processing CSV file' });
      });

    });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = uploadCSV;
