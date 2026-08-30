package expo.modules.datsmsreader

import android.Manifest
import android.content.pm.PackageManager
import android.provider.Telephony
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DatSmsReaderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DatSmsReader")

    AsyncFunction("getMessagesFromSenderSince") { sender: String, sinceEpochMs: Double ->
      val context = appContext.reactContext
        ?: throw IllegalStateException("Android context is unavailable.")

      val permissionGranted =
        context.checkSelfPermission(Manifest.permission.READ_SMS) ==
          PackageManager.PERMISSION_GRANTED

      if (!permissionGranted) {
        throw SecurityException(
          "READ_SMS permission has not been granted."
        )
      }

      val projection = arrayOf(
        Telephony.Sms._ID,
        Telephony.Sms.ADDRESS,
        Telephony.Sms.BODY,
        Telephony.Sms.DATE
      )

      val selection =
        "${Telephony.Sms.ADDRESS} = ? AND ${Telephony.Sms.DATE} >= ?"

      val selectionArgs = arrayOf(
        sender,
        sinceEpochMs.toLong().toString()
      )

      val messages = mutableListOf<Map<String, Any>>()

      context.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        projection,
        selection,
        selectionArgs,
        "${Telephony.Sms.DATE} ASC"
      )?.use { cursor ->
        val idIndex =
          cursor.getColumnIndexOrThrow(Telephony.Sms._ID)

        val senderIndex =
          cursor.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)

        val bodyIndex =
          cursor.getColumnIndexOrThrow(Telephony.Sms.BODY)

        val dateIndex =
          cursor.getColumnIndexOrThrow(Telephony.Sms.DATE)

        while (cursor.moveToNext()) {
          val id = cursor.getLong(idIndex).toString()
          val messageSender =
            cursor.getString(senderIndex) ?: ""
          val body =
            cursor.getString(bodyIndex) ?: ""
          val date = cursor.getLong(dateIndex)

          messages.add(
            mapOf(
              "id" to id,
              "address" to messageSender,
              "body" to body,
              "date" to date.toDouble()
            )
          )
        }
      }

      return@AsyncFunction messages
    }
  }
}