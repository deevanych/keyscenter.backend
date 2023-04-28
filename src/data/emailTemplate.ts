import mjml2html from 'mjml'
import {price} from "../../helpers/price";

const emailText = (products, orderSum) => {
  const emailProducts = products.map((product) => {
    const keysHtml = product.keys.map((key, index) => {
      return `<div>${index}. ${key}</div>`
    })

    return "<tr vertical-align=\"top\">\n" +
      "            <td align=\"left\" style=\"vertical-align: top; padding: 15px 15px 15px 0; border-bottom: 1px solid #eee;\">\n" +
      "            \t<img src=\"" + product.preview + "\" width=\"50px\" height=\"50px\" />\n" +
      "            </td>\n" +
      "            <td style=\"padding: 15px; border-bottom: 1px solid #eee;\">\n" +
      "              <div style=\"vertical-align: top; font-family: Trebuchet MS; font-weight: bold;\">" + product.title + ":</div>\n" +
      "            \t" + keysHtml.join('') + "\n" +
      "            </td>\n" +
      "            <td style=\"vertical-align: top; padding: 15px 15px; border-bottom: 1px solid #eee;\">" + product.keys.length + "</td>\n" +
      "            <td align=\"right\" style=\"vertical-align: top; padding: 15px 0 15px 15px; border-bottom: 1px solid #eee;\">"
      + price(product.keys.length * product.price) + "</td>\n" +
      "          </tr>\n"
  })

  return "<mjml>\n" +
    "  <mj-body>\n" +
    "    <mj-section>\n" +
    "      <mj-column>\n" +
    "        <mj-image align=\"left\" width=\"300px\" src=\"https://www.strapi.keyscenter.ru/uploads/keycenter_486ab83cec.png\"></mj-image>\n" +
    "        <mj-spacer height=\"30px\" />\n" +
    "        <mj-text font-size=\"40px\" color=\"#cf5b84\" font-family=\"Trebuchet MS\" font-weight=\"bold\">Спасибо за покупку!</mj-text>\n" +
    "        <mj-text font-size=\"20px\" color=\"#945bcf\" font-family=\"Trebuchet MS\">Вы получили это письмо, потому что недавно совершили заказ в магазине цифровых ключей <a target=\"_blank\" href=\"https://www.keyscenter.ru\">keyscenter.ru</a></mj-text>\n" +
    "        <mj-spacer height=\"30px\" />\n" +
    "        <mj-image align=\"left\" width=\"200px\" src=\"https://www.strapi.keyscenter.ru/uploads/divider_c883188f06.png\"></mj-image>\n" +
    "        <mj-spacer height=\"20px\" />\n" +
    "        <mj-text font-size=\"30px\" font-family=\"Trebuchet MS\" font-weight=\"bold\">Содержимое заказа:</mj-text>\n" +
    "        <mj-table>\n" +
    "          <tr style=\"border-bottom:1px solid #ecedee;text-align:left;padding:15px 0;\">\n" +
    "            <th style=\"padding: 0 15px 10px 0;\" colspan=\"2\">Товар</th>\n" +
    "            <th style=\"padding: 0 15px 10px;\">Количество</th>\n" +
    "            <th align=\"right\" style=\"padding: 0 0 10px 15px;\">Сумма</th>\n" +
    "          </tr>\n" + emailProducts.join('') +
    "          \t<tfoot>\n" +
    "              <td style=\"padding: 15px 0;\" colspan=\"3\"><div style=\"font-size: 20px; font-weight: bold\">Итого</div></td>\n" +
    "              <td style=\"padding: 15px 0;\" align=\"right\"><div style=\"font-size: 20px; font-weight: bold\">" + price(orderSum) + "</div></td>\n" +
    "          </tfoot>\n" +
    "        </mj-table>\n" +
    "      </mj-column>\n" +
    "    </mj-section>\n" +
    "  </mj-body>\n" +
    "</mjml>";
}

export const emailTemplate = (products, orderSum) => mjml2html(emailText(products, orderSum)).html
