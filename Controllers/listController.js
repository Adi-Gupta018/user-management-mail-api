const asyncHandler = require('express-async-handler')
const List = require('../db/Lists')
const CustomPropertyList = require('../db/CustomPropertyList');

const listInsertion = asyncHandler( async(req,res) => {
    console.log("list called");
    try {
        const { title, customProperties } = req.body;
    
        // 1. Create the List document
        const newList = new List({ title });
    
        // 2. Create CustomPropertyList documents for each provided property
        const createdCustomProperties = await Promise.all(
          customProperties.map(async (property) => {
            const newCustomProperty = new CustomPropertyList({
              title: property.title,
              list_id: newList._id, // Use the newly created list's ID
              defaultValue: property.defaultValue || '', // Set default value if provided, otherwise empty string
            });
            await newCustomProperty.save();
            return newCustomProperty; // Return the created custom property object
          })
        );
    
        // 3. Associate created custom properties with the list
        newList.customProperties = createdCustomProperties.map((cp) => cp._id);
        await newList.save();
    
        res.status(201).json({ message: 'List created successfully!', list: newList });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating list' });
      }
})

const fetchList = asyncHandler(async(req,res) => {
    try {
        const listId = req?.params?.list_id;
        if(!listId){
            const allLists = await List.find({}).populate('customProperties');
            if(!allLists) res.status(500).json({message:"There are no lists"});
            res.status(200).json(allLists);
        }

        const fetchedList = await List.findById(listId).populate('customProperties');

        if(!fetchedList) res.status(404).json({message:"List is not present"});

        res.status(200).json(fetchedList);
    } catch (error) {
        
    }
})

module.exports = {listInsertion,fetchList};