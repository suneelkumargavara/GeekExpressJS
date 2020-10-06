const advancedResults = (model, populate) => async (req, res, next) => {
  let query
  let reqQuery = { ...req.query }
  //Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit']
  //LoopOver and remove fields from gallery
  removeFields.forEach((param) => delete reqQuery[param])
  console.log(reqQuery)

  //Create query string
  let queryString = JSON.stringify(reqQuery)
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  )
  query = model.find(JSON.parse(queryString))

  //Select
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    query = query.sort('-createdAt')
  }
  //Pagenatin
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 25
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await model.countDocuments()
  query = query.skip(startIndex).limit(limit)

  if (populate) {
    query = query.populate(populate)
  }

  //Excecuting query
  const results = await query

  // pagenation result
  let pagenation = {}
  if (endIndex < total) {
    pagenation.next = {
      page: page + 1,
      limit
    }
  }

  if (startIndex > 0) {
    pagenation.prev = {
      page: page - 1,
      limit
    }
  }
  res.advancedResults = {
    success: true,
    count: results.count,
    pagenation,
    data: results
  }
  next()
}
module.exports = advancedResults
