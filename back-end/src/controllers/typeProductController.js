

// Get all type products
const getAllTypeProducts = async (req, res, next) => {
    try {
        const typeProducts = await typeProductService.getAllTypeProducts()
        res.status(200).json(typeProducts)
    } catch (error) {
        next(error)
    }
}

export const typeProductController = {
    getAllTypeProducts,
};