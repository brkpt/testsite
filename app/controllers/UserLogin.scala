package controllers

import javax.inject._

import play.api.mvc._
import play.api.data.Form
import play.api.data.Forms._
import play.api.i18n.{I18nSupport, MessagesApi}

case class UserLoginData(username: String, password: String)

@Singleton
class UserLogin @Inject() (cc: ControllerComponents) extends AbstractController(cc) with I18nSupport {

  val userLogin: Form[UserLoginData] = Form(
    mapping(
      "name" -> text,
      "password" -> text
    )(UserLoginData.apply)(UserLoginData.unapply)
  )

  def index() = Action { implicit request =>
    Ok(views.html.userlogin(userLogin))
  }

  def login() = Action { implicit request =>
    userLogin.bindFromRequest.fold(
      formWithErrors => {
        BadRequest("Error")
      },
      userData => {
        Ok("Done")
        // Redirect(routes.Application.home(id))
      }
    )
  }
}
