package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import play.api.db._
import play.api.Logger
import com.lucidchart.relate._
import java.sql.Connection
import java.sql.DriverManager

case class City(id: Int, name: String, countryCode: String, district: String, population: Int)

object City {
  implicit val parser: RowParser[City] = new RowParser[City] {
    def parse(row: SqlRow): City = {
     City(
       row.int("ID"),
       row.string("Name"),
       row.string("CountryCode"),
       row.string("District"),
       row.int("Population")
     )
    }
  }
}

@Singleton
class DoStuff @Inject() (db: Database, cc: ControllerComponents) extends AbstractController(cc){
  def main() = Action { implicit request: Request[AnyContent] =>
    implicit val connection: Connection  = db.getConnection()
    Class.forName("oracle.jdbc.driver.OracleDriver")
    try {
      val result = sql"select * from city".asList[City]
      Logger.debug(s"MRSMITH - ${result}")
    } catch {
      case ex: ClassNotFoundException =>
        println("Error: unable to load driver class!")
    } finally {
      connection.close()
    }

    Ok("Hello world")
  }
}
