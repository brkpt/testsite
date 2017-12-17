package controllers

import javax.inject._

import play.api.mvc._
import play.api.data.Form
import play.api.data.Forms._
import play.api.i18n.I18nSupport
import play.api.Logger

case class UserLoginData(username: String, password: String)

@Singleton
class UserLogin @Inject() (cc: ControllerComponents) extends AbstractController(cc) with I18nSupport {

  val userLogin: Form[UserLoginData] = Form(
    mapping(
      "username" -> text,
      "password" -> text
    )(UserLoginData.apply)(UserLoginData.unapply)
  )

  def index() = Action { implicit request =>
    Ok(views.html.userlogin(userLogin))
  }

  def login() = Action { implicit request =>
    Logger.trace("MRSMITH - login")
    userLogin.bindFromRequest.fold(
      formWithErrors => {
        BadRequest("This is my error")
      },
      userData => {
        Ok(s"User: ${userData.username}<p>Password: ${userData.password}")
        // Redirect(routes.Application.home(id))
      }
    )
  }
}
