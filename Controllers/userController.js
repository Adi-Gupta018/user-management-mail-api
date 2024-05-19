
// const asyncHandler = require('express-async-handler');
// const csv = require('csv-parser');
// const fs = require('fs');
// const multer = require('multer');
// const User = require('../db/Users');
// const List = require('../db/Lists');
// const UserCustomProperty = require('../db/UserCustomProperty');
// const CustomPropertyList = require('../db/CustomPropertyList');
// const { Parser } = require('json2csv');

// const upload = multer({ dest: 'uploads/' });

// const uploadCSV =  asyncHandler(async (req, res) => {
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
//       const users = [];
//       const userCustomProperties = [];
//       const promises = [];

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
//             userErrors.push({ ...row, error: error.message });
//           }
//         })());
//       });

//       csvStream.on('end', async () => {
//         try {
//           await Promise.all(promises);

//           const totalUsers = await User.countDocuments({ list: list._id });

//           if (failedUsers > 0) {
//             const json2csvParser = new Parser({ fields: Object.keys(userErrors[0]) });
//             const errorCsv = json2csvParser.parse(userErrors);

//             fs.unlink(filePath, (err) => {
//               if (err) {
//                 console.error('Error deleting uploaded file:', err);
//               }
//             });

//             res.status(400).json({
//               message: `${successfulUsers} users added successfully, ${failedUsers} users failed to add`,
//               successfulUsers,
//               failedUsers,
//               totalUsers,
//               userErrorsCsv: errorCsv, // Including the CSV data as a string in the response
//             });
//           } else {
//             await User.create(users);
//             await UserCustomProperty.create(userCustomProperties);

//             res.status(201).json({
//               message: 'CSV data uploaded successfully!',
//               successfulUsers,
//               failedUsers,
//               totalUsers,
//             });

//             fs.unlink(filePath, (err) => {
//               if (err) {
//                 console.error('Error deleting uploaded file:', err);
//               }
//             });
//           }
//         } catch (error) {
//           console.error('Error processing CSV data:', error);
//           res.status(500).json({ message: 'Error processing CSV data: ' + error.message });
//         }
//       });

//       csvStream.on('error', (err) => {
//         console.error('Error parsing CSV:', err);
//         res.status(500).json({ message: 'Error processing CSV file' });
//       });

//     });
//   } catch (error) {
//     console.error('Error uploading CSV:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });
const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');
const { Parser } = require('json2csv');
const asyncHandler = require('express-async-handler');
const User = require('../db/Users');
const List = require('../db/Lists');
const UserCustomProperty = require('../db/UserCustomProperty');
const CustomPropertyList = require('../db/CustomPropertyList');

const upload = multer({ dest: 'uploads/' });

const uploadCSV = asyncHandler(async (req, res) => {
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

            const existingUser = await User.findOne({ email, list: list._id });
            if (existingUser) {
              throw new Error(`Duplicate email in the same list: ${email}`);
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


const fetchUser = asyncHandler( async (req,res) => {
  try {
    const userId = req?.params?.user_id;

    if(!userId){
      const allusers = await User.find({}).populate('customProperties');
      if(!allusers) return res.status(404).json({message:"Users list is empty"});
      return res.status(200).json(allusers);
    }

    const fetchedUser = await User.findById(userId).populate('customProperties');
    if(!fetchedUser) return res.status(404).json({message:"User not found"});

    res.status(200).json(fetchedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({message:error});
  }
} );

const fetchListUsers = asyncHandler(async (req, res) => {
  const listId = req?.params?.list_id;

  if (!listId) {
    return res.status(400).json({ message: "Required parameter missing: listId" });
  }

  try {
    const fetchedUsers = await User.find({ list: listId }).populate('customProperties');

    if (!fetchedUsers || fetchedUsers.length === 0) {
      return res.status(404).json({ message: "List is empty" });
    }

    res.status(200).json(fetchedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = {uploadCSV,fetchUser,fetchListUsers};
