package controllers

import javax.inject._
import play.api.mvc._
import play.api.db._
import play.api.Logger

@Singleton
class App @Inject() (cc: ControllerComponents) extends AbstractController(cc) {
  def main() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.app())
  }
}

