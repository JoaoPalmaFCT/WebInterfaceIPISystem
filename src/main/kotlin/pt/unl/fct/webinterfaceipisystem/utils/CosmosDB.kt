package pt.unl.fct.webinterfaceipisystem.utils

import com.azure.cosmos.*
import com.azure.cosmos.models.CosmosItemRequestOptions
import com.azure.cosmos.models.CosmosItemResponse
import com.azure.cosmos.models.CosmosQueryRequestOptions
import com.azure.cosmos.models.PartitionKey
import com.azure.cosmos.util.CosmosPagedIterable


class CosmosDB(client: CosmosClient) {

    private var URL: String? = null
    private var KEY: String? = null
    private var DB_NAME: String? = null

    private var client: CosmosDB? = null
    private var db: CosmosDatabase? = null
    private val container: CosmosContainer? = null

    init{
        this.KEY = "4d4qs7ZrWPjbWLICjm8WsE1J9UCVb3HQWqR5g06C8GmQe0PX4kHmfPh7CH9xTClnB0QDK1DqWMhdACDbGQ3dMA=="
        this.URL = "https://ipisystemdb.documents.azure.com:443/"
        this.DB_NAME = "ipisystemdb"
        this.client = getInstance()
        this.db = getDatabase(DB_NAME)
    }

    private var instance: CosmosDB? = null

    @Synchronized
    fun getInstance(): CosmosDB {
        if (instance != null) return instance as CosmosDB

        val client = CosmosClientBuilder()
                .endpoint(URL)
                .key(KEY)
                .gatewayMode()
                .consistencyLevel(ConsistencyLevel.SESSION)
                .connectionSharingAcrossClientsEnabled(true)
                .contentResponseOnWriteEnabled(true)
                .buildClient()
        instance = CosmosDB(client)
        return instance as CosmosDB
    }

    @Synchronized
    private fun getDatabase(DB_NAME: String?): CosmosDatabase? {
        db = client?.getDatabase(this.DB_NAME)
        return db
    }

    fun getCosmosDbKey(): String {
        return KEY!!
    }

    fun setCosmosDbKey(cosmosDbKey: String?) {
        this.KEY = cosmosDbKey
    }

    fun getCosmosDbUrl(): String {
        return URL!!
    }

    fun setCosmosDbUrl(cosmosDbUrl: String?) {
        this.URL = cosmosDbUrl
    }

    fun getCosmosDB(): String {
        return DB_NAME!!
    }

    fun setCosmosDB(cosmosDB: String?) {
        this.DB_NAME = cosmosDB
    }

    fun delById(id: String?, container: String?): CosmosItemResponse<Any> {
        getDatabase(DB_NAME)
        val key: PartitionKey = PartitionKey(id)
        return db!!.getContainer(container).deleteItem(id, key, CosmosItemRequestOptions())
    }

    fun <T> put(container: String?, `object`: T): CosmosItemResponse<T> {
        getDatabase(DB_NAME)
        return db!!.getContainer(container).createItem(`object`)
    }

    fun <T> replace(`object`: T, id: String?, container: String?): CosmosItemResponse<T> {
        getDatabase(DB_NAME)
        val key: PartitionKey = PartitionKey(id)
        val cosmosContainer = db!!.getContainer(container)
        cosmosContainer.deleteItem(id, key, CosmosItemRequestOptions())
        return cosmosContainer.createItem(`object`)
    }

    fun <T> getById(id: String, containerType: String, objectClass: Class<T>?): T? {
        getDatabase(DB_NAME)
        val response = db!!.getContainer(containerType).queryItems("SELECT * FROM $containerType WHERE $containerType.id=\"$id\"", CosmosQueryRequestOptions(), objectClass)
        val it: Iterator<T> = response.iterator()
        if (it.hasNext()) return it.next()
        return null
    }

    fun <T> getList(containerType: String, objectClass: Class<T>?): CosmosPagedIterable<T> {
        getDatabase(DB_NAME)
        return db!!.getContainer(containerType).queryItems("SELECT * FROM $containerType", CosmosQueryRequestOptions(), objectClass)
    }

    fun close() {
        client!!.close()
    }
}