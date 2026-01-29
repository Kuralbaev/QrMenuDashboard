import {
  getProductsFromApi,
  getProductById,
  updateProduct,
  uploadFile,
  publishProduct,
  unpublishProduct,
  type GetProductsParams,
  type UpdateProductData,
} from '../api/product'
import type { Product } from '../types/api'

export function useProductService() {
  async function getAll(params: GetProductsParams) {
    const response = await getProductsFromApi(params)
    return response
  }

  async function getById(id: string): Promise<Product> {
    return await getProductById(id)
  }

  async function update(id: string, data: UpdateProductData): Promise<Product> {
    return await updateProduct(id, data)
  }

  async function upload(file: File) {
    return await uploadFile(file)
  }

  async function publish(id: string): Promise<Product> {
    return await publishProduct(id)
  }

  async function unpublish(id: string): Promise<Product> {
    return await unpublishProduct(id)
  }

  return {
    getAll,
    getById,
    update,
    upload,
    publish,
    unpublish,
  }
}
