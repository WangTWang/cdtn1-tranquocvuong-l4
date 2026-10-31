-- Buoi 12 (TD-19): tim phieu theo ten khach KHONG phan biet dau ("pham" tim ra "Phạm").
-- Ham thuan SQL (khong can extension unaccent). Liet ke ca chu HOA co dau vi lower() cua mot so locale
-- (vd C) chi doi chu ASCII.
CREATE OR REPLACE FUNCTION khong_dau(s text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT lower(translate(s, 'áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ', 'aaaaaaaaaaaaaaaaadeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyaaaaaaaaaaaaaaaaadeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyy'))
$$;
