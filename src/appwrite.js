import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {

  try{

    // user appwrite api document is exist
    const result =
      await database.listDocuments(
        DATABASE_ID, COLLECTION_ID, [
          Query.equal('searchTerm', searchTerm)
        ]
      )

    // if yes then update the count
    if(result.documents.length > 0){
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1
      })
    } else {
      // if no. create document and set count 1
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      })
    }
  }
  catch (error){
    console.error(error)
  }
}

export const getTrendingMovies = async () => {
  try{
    const results = await database.listDocuments(
      DATABASE_ID, COLLECTION_ID, [
        Query.limit(10),
          Query.orderDesc('count'),
      ]
    )

    return results.documents;
  }
  catch (error){
    console.error(error)
  }
}